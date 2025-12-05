const db = require('../config/database');
const asyncHandler = require('express-async-handler');
const ExcelJS = require('exceljs');
const { format } = require('date-fns');

// Helper to get organization ID
const getOrgId = (req) => {
  return req.user?.org_id || req.headers['x-org-id'] || null;
};

// @desc    Get comprehensive business report
// @route   GET /api/business-report
exports.getBusinessReport = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const { start_date, end_date, report_type = 'daily' } = req.query;
  const now = new Date();
  
  // Set default dates based on report type
  let startDate, endDate;
  
  if (start_date && end_date) {
    startDate = new Date(start_date);
    endDate = new Date(end_date);
  } else {
    switch (report_type) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'weekly':
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate());
        endDate = new Date();
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }
  }

  // Today's Income
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  const [todayIncome] = await db.query(`
    SELECT 
      COUNT(*) as total_bills,
      SUM(total_amount) as total_sales,
      SUM(paid_amount) as total_collected,
      SUM(due_amount) as total_due
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
      AND (payment_status = 'paid' OR payment_status = 'partial')
  `, [orgId, todayStart, todayEnd]);

  // Monthly Income
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  const [monthlyIncome] = await db.query(`
    SELECT 
      COUNT(*) as total_bills,
      SUM(total_amount) as total_sales,
      SUM(paid_amount) as total_collected,
      SUM(due_amount) as total_due,
      AVG(total_amount) as average_bill_value
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
  `, [orgId, monthStart, monthEnd]);

  // Total Dues (Pending + Partial Payments)
  const [totalDues] = await db.query(`
    SELECT 
      COUNT(*) as total_due_bills,
      SUM(due_amount) as total_due_amount,
      SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_bills,
      SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_bills
    FROM bills 
    WHERE org_id = ? 
      AND payment_status IN ('pending', 'partial')
      AND due_amount > 0
  `, [orgId]);

  // Sales by Payment Method
  const [paymentMethodStats] = await db.query(`
    SELECT 
      payment_method,
      COUNT(*) as bill_count,
      SUM(total_amount) as total_amount,
      SUM(paid_amount) as paid_amount,
      SUM(due_amount) as due_amount
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
    GROUP BY payment_method
    ORDER BY total_amount DESC
  `, [orgId, startDate, endDate]);

  // Daily Sales Trend (Last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [dailyTrend] = await db.query(`
    SELECT 
      DATE(created_at) as sale_date,
      COUNT(*) as bill_count,
      SUM(total_amount) as daily_sales,
      SUM(paid_amount) as daily_collection,
      SUM(due_amount) as daily_due
    FROM bills 
    WHERE org_id = ? 
      AND created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY sale_date DESC
    LIMIT 30
  `, [orgId, thirtyDaysAgo]);

  // Top Selling Products - FIXED: Join with categories table
  const [topProducts] = await db.query(`
    SELECT 
      p.product_name,
      p.sku,
      c.category_name,
      SUM(bi.quantity) as total_quantity_sold,
      SUM(bi.total_price) as total_revenue,
      COUNT(DISTINCT b.bill_id) as times_sold
    FROM bill_items bi
    JOIN products p ON bi.product_id = p.product_id
    JOIN bills b ON bi.bill_id = b.bill_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE b.org_id = ? 
      AND b.created_at BETWEEN ? AND ?
    GROUP BY p.product_id, p.product_name, p.sku, p.category_id
    ORDER BY total_quantity_sold DESC
    LIMIT 10
  `, [orgId, startDate, endDate]);

  // Customer Statistics
  const [customerStats] = await db.query(`
    SELECT 
      COUNT(DISTINCT customer_phone) as total_customers,
      COUNT(DISTINCT CASE WHEN created_at BETWEEN ? AND ? THEN customer_phone END) as new_customers,
      AVG(total_amount) as average_customer_spend
    FROM bills 
    WHERE org_id = ?
      AND customer_phone IS NOT NULL
  `, [startDate, endDate, orgId]);

  // Bill Status Distribution
  const [billStatus] = await db.query(`
    SELECT 
      payment_status,
      COUNT(*) as bill_count,
      SUM(total_amount) as total_amount,
      SUM(paid_amount) as paid_amount,
      SUM(due_amount) as due_amount
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
    GROUP BY payment_status
  `, [orgId, startDate, endDate]);

  // Organization Info
  const [orgInfo] = await db.query(`
    SELECT org_name, org_logo, gst_number, gst_type, gst_percentage
    FROM organizations 
    WHERE org_id = ?
  `, [orgId]);

  const reportData = {
    organization: orgInfo[0] || {},
    date_range: {
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      report_type
    },
    summary: {
      today: {
        total_bills: todayIncome[0]?.total_bills || 0,
        total_sales: parseFloat(todayIncome[0]?.total_sales || 0).toFixed(2),
        total_collected: parseFloat(todayIncome[0]?.total_collected || 0).toFixed(2),
        total_due: parseFloat(todayIncome[0]?.total_due || 0).toFixed(2)
      },
      monthly: {
        total_bills: monthlyIncome[0]?.total_bills || 0,
        total_sales: parseFloat(monthlyIncome[0]?.total_sales || 0).toFixed(2),
        total_collected: parseFloat(monthlyIncome[0]?.total_collected || 0).toFixed(2),
        total_due: parseFloat(monthlyIncome[0]?.total_due || 0).toFixed(2),
        average_bill_value: parseFloat(monthlyIncome[0]?.average_bill_value || 0).toFixed(2)
      },
      dues: {
        total_due_bills: totalDues[0]?.total_due_bills || 0,
        total_due_amount: parseFloat(totalDues[0]?.total_due_amount || 0).toFixed(2),
        pending_bills: totalDues[0]?.pending_bills || 0,
        partial_bills: totalDues[0]?.partial_bills || 0
      },
      customers: {
        total_customers: customerStats[0]?.total_customers || 0,
        new_customers: customerStats[0]?.new_customers || 0,
        average_spend: parseFloat(customerStats[0]?.average_customer_spend || 0).toFixed(2)
      }
    },
    payment_methods: paymentMethodStats,
    daily_trend: dailyTrend.map(day => ({
      ...day,
      daily_sales: parseFloat(day.daily_sales || 0).toFixed(2),
      daily_collection: parseFloat(day.daily_collection || 0).toFixed(2),
      daily_due: parseFloat(day.daily_due || 0).toFixed(2)
    })),
    top_products: topProducts.map(product => ({
      ...product,
      total_revenue: parseFloat(product.total_revenue || 0).toFixed(2)
    })),
    bill_status: billStatus.map(status => ({
      ...status,
      total_amount: parseFloat(status.total_amount || 0).toFixed(2),
      paid_amount: parseFloat(status.paid_amount || 0).toFixed(2),
      due_amount: parseFloat(status.due_amount || 0).toFixed(2)
    }))
  };

  res.json({
    success: true,
    data: reportData
  });
});
// @desc    Export business report to Excel
// @route   GET /api/business-report/export
exports.exportBusinessReport = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { start_date, end_date, report_type = 'monthly' } = req.query;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  // Get organization info
  const [orgInfo] = await db.query(`
    SELECT org_name, gst_number, address, primary_phone
    FROM organizations 
    WHERE org_id = ?
  `, [orgId]);

  const organization = orgInfo[0];

  // Set date range
  let startDate, endDate;
  const now = new Date();
  
  if (start_date && end_date) {
    startDate = new Date(start_date);
    endDate = new Date(end_date);
  } else {
    switch (report_type) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
        endDate = new Date();
    }
  }

  // Get bills for the period
  const [bills] = await db.query(`
    SELECT 
      bill_number,
      customer_name,
      customer_phone,
      total_amount,
      paid_amount,
      due_amount,
      payment_method,
      payment_status,
      created_at,
      due_date,
      gst_type,
      shipment_charges,
      discount_amount,
      tax_amount
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
    ORDER BY created_at DESC
  `, [orgId, startDate, endDate]);

  // Get bill items for detailed report
  const [billItems] = await db.query(`
    SELECT 
      b.bill_number,
      p.product_name,
      p.sku,
      bi.quantity,
      bi.unit_price,
      bi.total_price,
      b.created_at
    FROM bill_items bi
    JOIN bills b ON bi.bill_id = b.bill_id
    JOIN products p ON bi.product_id = p.product_id
    WHERE b.org_id = ? 
      AND b.created_at BETWEEN ? AND ?
    ORDER BY b.created_at DESC
  `, [orgId, startDate, endDate]);

  // Get summary statistics
  const [summary] = await db.query(`
    SELECT 
      COUNT(*) as total_bills,
      SUM(total_amount) as total_sales,
      SUM(paid_amount) as total_collected,
      SUM(due_amount) as total_dues,
      AVG(total_amount) as average_bill,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_bills,
      SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_bills,
      SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_bills
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
  `, [orgId, startDate, endDate]);

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  
  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Add organization header
  summarySheet.mergeCells('A1:D1');
  summarySheet.getCell('A1').value = organization.org_name;
  summarySheet.getCell('A1').font = { size: 16, bold: true };
  summarySheet.getCell('A1').alignment = { horizontal: 'center' };

  summarySheet.mergeCells('A2:D2');
  summarySheet.getCell('A2').value = 'Business Report';
  summarySheet.getCell('A2').font = { size: 14, bold: true };
  summarySheet.getCell('A2').alignment = { horizontal: 'center' };

  summarySheet.mergeCells('A3:D3');
  summarySheet.getCell('A3').value = `Period: ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`;
  summarySheet.getCell('A3').alignment = { horizontal: 'center' };

  // Add summary data
  summarySheet.addRow([]);
  summarySheet.addRow(['Financial Summary']);
  summarySheet.addRow(['Total Bills', summary[0].total_bills]);
  summarySheet.addRow(['Total Sales', `₹${parseFloat(summary[0].total_sales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]);
  summarySheet.addRow(['Total Collected', `₹${parseFloat(summary[0].total_collected || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]);
  summarySheet.addRow(['Total Dues', `₹${parseFloat(summary[0].total_dues || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]);
  summarySheet.addRow(['Average Bill Value', `₹${parseFloat(summary[0].average_bill || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]);
  
  summarySheet.addRow([]);
  summarySheet.addRow(['Bill Status Distribution']);
  summarySheet.addRow(['Paid Bills', summary[0].paid_bills]);
  summarySheet.addRow(['Pending Bills', summary[0].pending_bills]);
  summarySheet.addRow(['Partial Payment Bills', summary[0].partial_bills]);

  // Bills Sheet
  const billsSheet = workbook.addWorksheet('Bills');
  billsSheet.columns = [
    { header: 'Bill No.', key: 'bill_number', width: 15 },
    { header: 'Customer Name', key: 'customer_name', width: 20 },
    { header: 'Phone', key: 'customer_phone', width: 15 },
    { header: 'Total Amount', key: 'total_amount', width: 15 },
    { header: 'Paid Amount', key: 'paid_amount', width: 15 },
    { header: 'Due Amount', key: 'due_amount', width: 15 },
    { header: 'Payment Method', key: 'payment_method', width: 15 },
    { header: 'Status', key: 'payment_status', width: 12 },
    { header: 'Date', key: 'created_at', width: 15 },
    { header: 'Due Date', key: 'due_date', width: 15 }
  ];

  bills.forEach(bill => {
    billsSheet.addRow({
      bill_number: bill.bill_number,
      customer_name: bill.customer_name,
      customer_phone: bill.customer_phone,
      total_amount: parseFloat(bill.total_amount).toFixed(2),
      paid_amount: parseFloat(bill.paid_amount).toFixed(2),
      due_amount: parseFloat(bill.due_amount).toFixed(2),
      payment_method: bill.payment_method,
      payment_status: bill.payment_status,
      created_at: format(new Date(bill.created_at), 'dd/MM/yyyy HH:mm'),
      due_date: bill.due_date ? format(new Date(bill.due_date), 'dd/MM/yyyy') : 'N/A'
    });
  });

  // Bill Items Sheet
  const itemsSheet = workbook.addWorksheet('Bill Items');
  itemsSheet.columns = [
    { header: 'Bill No.', key: 'bill_number', width: 15 },
    { header: 'Product Name', key: 'product_name', width: 25 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Unit Price', key: 'unit_price', width: 12 },
    { header: 'Total Price', key: 'total_price', width: 12 },
    { header: 'Date', key: 'created_at', width: 15 }
  ];

  billItems.forEach(item => {
    itemsSheet.addRow({
      bill_number: item.bill_number,
      product_name: item.product_name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price).toFixed(2),
      total_price: parseFloat(item.total_price).toFixed(2),
      created_at: format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')
    });
  });

  // Style the sheets
  [summarySheet, billsSheet, itemsSheet].forEach(sheet => {
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  });

  // Set response headers for file download
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Business_Report_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`
  );

  // Write workbook to response
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Get overdue bills
// @route   GET /api/business-report/overdue
exports.getOverdueBills = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [overdueBills] = await db.query(`
    SELECT 
      b.bill_id,
      b.bill_number,
      b.customer_name,
      b.customer_phone,
      b.total_amount,
      b.paid_amount,
      b.due_amount,
      b.payment_status,
      b.created_at,
      b.due_date,
      DATEDIFF(CURDATE(), b.due_date) as days_overdue,
      u.full_name as created_by_name
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.user_id
    WHERE b.org_id = ? 
      AND b.payment_status IN ('pending', 'partial')
      AND b.due_date IS NOT NULL
      AND b.due_date < CURDATE()
      AND b.due_amount > 0
    ORDER BY b.due_date ASC
  `, [orgId]);

  const totalOverdueAmount = overdueBills.reduce((sum, bill) => {
    return sum + parseFloat(bill.due_amount);
  }, 0);

  res.json({
    success: true,
    data: {
      total_overdue_bills: overdueBills.length,
      total_overdue_amount: totalOverdueAmount.toFixed(2),
      bills: overdueBills.map(bill => ({
        ...bill,
        total_amount: parseFloat(bill.total_amount).toFixed(2),
        paid_amount: parseFloat(bill.paid_amount).toFixed(2),
        due_amount: parseFloat(bill.due_amount).toFixed(2)
      }))
    }
  });
});

// @desc    Get sales trend by date range
// @route   GET /api/business-report/sales-trend
exports.getSalesTrend = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { period = 'daily', start_date, end_date } = req.query;
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  let dateFormat, groupBy;
  let now = new Date();
  let defaultStartDate, defaultEndDate;

  switch (period) {
    case 'daily':
      dateFormat = '%Y-%m-%d';
      groupBy = 'DATE(created_at)';
      defaultStartDate = new Date(now.setDate(now.getDate() - 30));
      defaultEndDate = new Date();
      break;
    case 'weekly':
      dateFormat = '%Y-%u';
      groupBy = 'YEARWEEK(created_at)';
      defaultStartDate = new Date(now.setDate(now.getDate() - 180));
      defaultEndDate = new Date();
      break;
    case 'monthly':
      dateFormat = '%Y-%m';
      groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
      defaultStartDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      defaultEndDate = new Date();
      break;
    default:
      dateFormat = '%Y-%m-%d';
      groupBy = 'DATE(created_at)';
      defaultStartDate = new Date(now.setDate(now.getDate() - 30));
      defaultEndDate = new Date();
  }

  const startDate = start_date ? new Date(start_date) : defaultStartDate;
  const endDate = end_date ? new Date(end_date) : defaultEndDate;

  const [salesTrend] = await db.query(`
    SELECT 
      ${groupBy} as period,
      DATE_FORMAT(created_at, ?) as period_label,
      COUNT(*) as bill_count,
      SUM(total_amount) as total_sales,
      SUM(paid_amount) as total_collected,
      SUM(due_amount) as total_due,
      AVG(total_amount) as average_bill
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
    GROUP BY ${groupBy}, period_label
    ORDER BY period ASC
  `, [dateFormat, orgId, startDate, endDate]);

  res.json({
    success: true,
    data: {
      period,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      trend: salesTrend.map(period => ({
        ...period,
        total_sales: parseFloat(period.total_sales || 0).toFixed(2),
        total_collected: parseFloat(period.total_collected || 0).toFixed(2),
        total_due: parseFloat(period.total_due || 0).toFixed(2),
        average_bill: parseFloat(period.average_bill || 0).toFixed(2)
      }))
    }
  });
});

// @desc    Get top customers
// @route   GET /api/business-report/top-customers
exports.getTopCustomers = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { limit = 10, start_date, end_date } = req.query;
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const startDate = start_date ? new Date(start_date) : new Date(new Date().setDate(new Date().getDate() - 365));
  const endDate = end_date ? new Date(end_date) : new Date();

  const [topCustomers] = await db.query(`
    SELECT 
      customer_name,
      customer_phone,
      customer_email,
      COUNT(*) as total_bills,
      SUM(total_amount) as total_spent,
      SUM(paid_amount) as total_paid,
      SUM(due_amount) as total_due,
      MAX(created_at) as last_purchase_date,
      MIN(created_at) as first_purchase_date,
      AVG(total_amount) as average_bill_value
    FROM bills 
    WHERE org_id = ? 
      AND customer_name IS NOT NULL
      AND created_at BETWEEN ? AND ?
    GROUP BY customer_phone, customer_name, customer_email
    HAVING total_bills > 0
    ORDER BY total_spent DESC
    LIMIT ?
  `, [orgId, startDate, endDate, parseInt(limit)]);

  res.json({
    success: true,
    data: {
      customers: topCustomers.map(customer => ({
        ...customer,
        total_spent: parseFloat(customer.total_spent || 0).toFixed(2),
        total_paid: parseFloat(customer.total_paid || 0).toFixed(2),
        total_due: parseFloat(customer.total_due || 0).toFixed(2),
        average_bill_value: parseFloat(customer.average_bill_value || 0).toFixed(2),
        last_purchase_date: customer.last_purchase_date ? format(new Date(customer.last_purchase_date), 'dd/MM/yyyy') : 'N/A',
        first_purchase_date: customer.first_purchase_date ? format(new Date(customer.first_purchase_date), 'dd/MM/yyyy') : 'N/A'
      }))
    }
  });
});