const db = require('../config/database');
const asyncHandler = require('express-async-handler');

// Helper to get organization ID
const getOrgId = (req) => {
  return req.user?.org_id || req.headers['x-org-id'] || null;
};

// Update the createBill function
exports.createBill = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const { 
    customer_name, 
    customer_phone, 
    customer_email, 
    customer_address,
    items, 
    gst_type = 'with_gst',
    discount_amount, 
    discount_percentage, 
    tax_amount, 
    tax_percentage,
    shipment_charges = 0,
    installation_charges = 0, 
    payment_method,
    transaction_id,
    cheque_number,
    bank_name,
    notes,
    paid_amount, 
    due_date
  } = req.body;

  // Validation
  if (!customer_name || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Customer name and at least one item are required'
    });
  }

  // Validate payment method specific fields
  if ((payment_method === 'upi' || payment_method === 'card') && !transaction_id) {
    return res.status(400).json({
      success: false,
      message: 'Transaction ID is required for UPI/Card payments'
    });
  }

  if (payment_method === 'cheque' && (!cheque_number || !bank_name)) {
    return res.status(400).json({
      success: false,
      message: 'Cheque number and bank name are required for cheque payments'
    });
  }

  // Get organization details
  const [orgs] = await db.query(
    'SELECT * FROM organizations WHERE org_id = ?',
    [orgId]
  );
  
  if (orgs.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Organization not found'
    });
  }

  const organization = orgs[0];

  // Calculate totals
  let subtotal = 0;
  let totalQuantity = 0;

  // Validate items and calculate subtotal
  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Each item must have a valid product and quantity'
      });
    }

    // Get product price and stock
    const [products] = await db.query(
      'SELECT product_name, price, stock_quantity FROM products WHERE product_id = ? AND org_id = ?',
      [item.product_id, orgId]
    );

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Product with ID ${item.product_id} not found in your organization`
      });
    }

    const product = products[0];
    
    // Check stock
    if (product.stock_quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.product_name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`
      });
    }

    const itemTotal = parseFloat(product.price) * parseInt(item.quantity);
    subtotal += itemTotal;
    totalQuantity += parseInt(item.quantity);
  }

  // Calculate discount
  let discount = 0;
  if (discount_amount) {
    discount = parseFloat(discount_amount);
  } else if (discount_percentage) {
    discount = (subtotal * parseFloat(discount_percentage)) / 100;
  }

  // Calculate taxable amount
  const taxableAmount = subtotal - discount;

  // Apply tax based on GST type
  let tax = 0;
  if (gst_type === 'with_gst') {
    if (tax_amount) {
      tax = parseFloat(tax_amount);
    } else if (tax_percentage) {
      tax = (taxableAmount * parseFloat(tax_percentage)) / 100;
    } else if (organization.gst_percentage > 0) {
      tax = (taxableAmount * parseFloat(organization.gst_percentage)) / 100;
    }
  }

  // Calculate shipment charges
  const shipment = parseFloat(shipment_charges) || 0;
  const installation = parseFloat(installation_charges) || 0;

  // Calculate total amount
  const total_amount = parseFloat((taxableAmount + tax + installation + shipment).toFixed(2));
  
  // Handle payment
  const paidAmount = parseFloat(paid_amount || total_amount);
  const dueAmount = parseFloat((total_amount - paidAmount).toFixed(2));
  
  let payment_status = 'paid';
  if (dueAmount === total_amount) {
    payment_status = 'pending';
  } else if (dueAmount > 0) {
    payment_status = 'partial';
  }

  // Generate bill number
  const generateBillNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const orgPrefix = organization.org_name.substring(0, 3).toUpperCase();
    return `${orgPrefix}-${year}${month}${day}-${random4}`;
  };

  const billNumber = generateBillNumber();

  // Start transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Create bill with all fields
    const [billResult] = await connection.query(
      `INSERT INTO bills (
        bill_number, customer_name, customer_phone, customer_email, customer_address,
        subtotal, discount_amount, tax_amount, total_amount, total_quantity,
        gst_type, shipment_charges,installation_charges, payment_method, transaction_id, cheque_number, bank_name,
        notes, created_by, org_id, paid_amount, due_amount, payment_status, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billNumber,
        customer_name,
        customer_phone || null,
        customer_email || null,
        customer_address || null,
        subtotal.toFixed(2),
        discount.toFixed(2),
        tax.toFixed(2),
        total_amount,
        totalQuantity,
        gst_type,
        shipment.toFixed(2),
        installation.toFixed(2),
        payment_method || 'cash',
        transaction_id || null,
        cheque_number || null,
        bank_name || null,
        notes || null,
        req.user.id,
        orgId,
        paidAmount.toFixed(2),
        dueAmount.toFixed(2),
        payment_status,
        due_date || null
      ]
    );

    const billId = billResult.insertId;

    // Create bill items
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT product_name, price, stock_quantity FROM products WHERE product_id = ? AND org_id = ?',
        [item.product_id, orgId]
      );
      const product = products[0];

      await connection.query(
        `INSERT INTO bill_items (
          bill_id, product_id, product_name, quantity, unit_price, total_price, org_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          billId,
          item.product_id,
          product.product_name,
          item.quantity,
          parseFloat(product.price).toFixed(2),
          (parseFloat(product.price) * parseInt(item.quantity)).toFixed(2),
          orgId
        ]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND org_id = ?',
        [item.quantity, item.product_id, orgId]
      );
    }

    // Commit transaction
    await connection.commit();
    connection.release();

    // Get the complete bill
    const [bills] = await db.query(`
      SELECT b.*, u.full_name as created_by_name, o.*
      FROM bills b
      LEFT JOIN users u ON b.created_by = u.user_id
      LEFT JOIN organizations o ON b.org_id = o.org_id
      WHERE b.bill_id = ? AND b.org_id = ?
    `, [billId, orgId]);

    const [billItems] = await db.query(`
      SELECT bi.*, p.product_name, p.sku
      FROM bill_items bi
      LEFT JOIN products p ON bi.product_id = p.product_id
      WHERE bi.bill_id = ? AND bi.org_id = ?
    `, [billId, orgId]);

    const billData = {
      ...bills[0],
      items: billItems
    };

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: billData
    });

  } catch (error) {
    await connection.rollback();
    connection.release();
    
    console.error('Error creating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating bill'
    });
  }
});

// Update getBill function to include new fields
exports.getBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = getOrgId(req);

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const [bills] = await db.query(`
    SELECT 
      b.*, 
      u.full_name as created_by_name,
      o.org_name,
      o.org_logo,
      o.gst_number,
      o.gst_type as org_gst_type,
      o.gst_percentage,
      o.address as org_address,
      o.contact_person_name,
      o.primary_phone,
      o.secondary_phone
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.user_id
    LEFT JOIN organizations o ON b.org_id = o.org_id
    WHERE b.bill_id = ? AND b.org_id = ?
  `, [id, orgId]);

  if (bills.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found in your organization'
    });
  }

  const [items] = await db.query(`
    SELECT bi.*, p.product_name, p.sku, p.description
    FROM bill_items bi
    LEFT JOIN products p ON bi.product_id = p.product_id
    WHERE bi.bill_id = ? AND bi.org_id = ?
  `, [id, orgId]);

  const billData = {
    ...bills[0],
    items
  };

  res.json({
    success: true,
    data: billData
  });
});

// Update your billing.controller.js - updatePayment function
exports.updatePayment = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { id } = req.params;
  const { paid_amount, payment_amount } = req.body;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  if (!paid_amount || paid_amount < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid paid amount is required'
    });
  }

  // Get current bill
  const [bills] = await db.query(
    'SELECT * FROM bills WHERE bill_id = ? AND org_id = ?',
    [id, orgId]
  );

  if (bills.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Bill not found'
    });
  }

  const bill = bills[0];
  const newPaidAmount = parseFloat(paid_amount);
  const totalAmount = parseFloat(bill.total_amount);
  const dueAmount = parseFloat((totalAmount - newPaidAmount).toFixed(2));
  
  // Validate paid amount
  if (newPaidAmount > totalAmount) {
    return res.status(400).json({
      success: false,
      message: `Paid amount cannot exceed total amount of ₹${totalAmount.toLocaleString('en-IN')}`
    });
  }
  
  let payment_status = 'paid';
  if (dueAmount === totalAmount) {
    payment_status = 'pending';
  } else if (dueAmount > 0) {
    payment_status = 'partial';
  }

  // Update payment
  await db.query(
    `UPDATE bills SET 
      paid_amount = ?, 
      due_amount = ?, 
      payment_status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE bill_id = ? AND org_id = ?`,
    [newPaidAmount.toFixed(2), dueAmount.toFixed(2), payment_status, id, orgId]
  );

  // Get updated bill
  const [updatedBills] = await db.query(`
    SELECT b.*, u.full_name as created_by_name, o.*
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.user_id
    LEFT JOIN organizations o ON b.org_id = o.org_id
    WHERE b.bill_id = ? AND b.org_id = ?
  `, [id, orgId]);

  const [billItems] = await db.query(`
    SELECT bi.*, p.product_name, p.sku, p.description
    FROM bill_items bi
    LEFT JOIN products p ON bi.product_id = p.product_id
    WHERE bi.bill_id = ? AND bi.org_id = ?
  `, [id, orgId]);

  const billData = {
    ...updatedBills[0],
    items: billItems
  };

  res.json({
    success: true,
    message: 'Payment updated successfully',
    data: billData
  });
});
// @desc    Get all bills for current organization
// @route   GET /api/bills
exports.getAllBills = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const { 
    page = 1, 
    limit = 20, 
    start_date, 
    end_date, 
    customer_name,
    bill_number,
    payment_method
  } = req.query;

  const offset = (page - 1) * limit;

  let query = `
    SELECT b.*, u.full_name as created_by_name
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.user_id
    WHERE b.org_id = ?
  `;
  const params = [orgId];

  if (start_date && end_date) {
    query += ' AND DATE(b.created_at) BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }

  if (customer_name) {
    query += ' AND b.customer_name LIKE ?';
    params.push(`%${customer_name}%`);
  }

  if (bill_number) {
    query += ' AND b.bill_number LIKE ?';
    params.push(`%${bill_number}%`);
  }

  if (payment_method) {
    query += ' AND b.payment_method = ?';
    params.push(payment_method);
  }

  query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [bills] = await db.query(query, params);

  // Get items for each bill
  for (let bill of bills) {
    const [items] = await db.query(`
      SELECT bi.*, p.product_name, p.sku
      FROM bill_items bi
      LEFT JOIN products p ON bi.product_id = p.product_id
      WHERE bi.bill_id = ? AND bi.org_id = ?
    `, [bill.bill_id, orgId]);
    bill.items = items;
  }

  // Get total count for the organization
  let countQuery = 'SELECT COUNT(*) as total FROM bills WHERE org_id = ?';
  const countParams = [orgId];

  if (start_date && end_date) {
    countQuery += ' AND DATE(created_at) BETWEEN ? AND ?';
    countParams.push(start_date, end_date);
  }

  if (customer_name) {
    countQuery += ' AND customer_name LIKE ?';
    countParams.push(`%${customer_name}%`);
  }

  const [countResult] = await db.query(countQuery, countParams);
  const total = countResult[0].total;

  res.json({
    success: true,
    data: bills,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});



// @desc    Search products for billing within organization
// @route   GET /api/bills/products/search
exports.searchProducts = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { search, category_id } = req.query;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  let query = `
    SELECT product_id, product_name, sku, price, stock_quantity, 
           description, category_id
    FROM products 
    WHERE org_id = ? AND is_active = TRUE AND stock_quantity > 0
  `;
  const params = [orgId];

  if (search) {
    query += ' AND (product_name LIKE ? OR sku LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (category_id) {
    query += ' AND category_id = ?';
    params.push(category_id);
  }

  query += ' ORDER BY product_name LIMIT 20';

  const [products] = await db.query(query, params);

  res.json({
    success: true,
    data: products
  });
});

// @desc    Get billing statistics for current organization
// @route   GET /api/bills/statistics
exports.getBillingStatistics = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { period = 'today' } = req.query;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  let dateFilter = '';
  const currentDate = new Date();

  switch (period) {
    case 'today':
      dateFilter = 'DATE(created_at) = CURDATE()';
      break;
    case 'week':
      dateFilter = 'YEARWEEK(created_at) = YEARWEEK(CURDATE())';
      break;
    case 'month':
      dateFilter = 'YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())';
      break;
    case 'year':
      dateFilter = 'YEAR(created_at) = YEAR(CURDATE())';
      break;
    default:
      dateFilter = 'DATE(created_at) = CURDATE()';
  }

  // Total sales for organization
  const [totalSales] = await db.query(`
    SELECT 
      COUNT(*) as total_bills,
      SUM(total_amount) as total_revenue,
      SUM(total_quantity) as total_items_sold,
      AVG(total_amount) as average_bill_value
    FROM bills 
    WHERE org_id = ? AND ${dateFilter}
  `, [orgId]);

  // Today's bills count for organization
  const [todayBills] = await db.query(`
    SELECT COUNT(*) as count 
    FROM bills 
    WHERE org_id = ? AND DATE(created_at) = CURDATE()
  `, [orgId]);

  // Payment method distribution for organization
  const [paymentMethods] = await db.query(`
    SELECT 
      payment_method,
      COUNT(*) as count,
      SUM(total_amount) as amount
    FROM bills 
    WHERE org_id = ? AND ${dateFilter}
    GROUP BY payment_method
  `, [orgId]);

  // Top selling products for organization
  const [topProducts] = await db.query(`
    SELECT 
      p.product_name,
      SUM(bi.quantity) as total_sold,
      SUM(bi.total_price) as total_revenue
    FROM bill_items bi
    JOIN products p ON bi.product_id = p.product_id
    JOIN bills b ON bi.bill_id = b.bill_id
    WHERE b.org_id = ? AND ${dateFilter.replace('created_at', 'b.created_at')}
    GROUP BY p.product_id, p.product_name
    ORDER BY total_sold DESC
    LIMIT 5
  `, [orgId]);

  const statistics = {
    total_bills: totalSales[0].total_bills || 0,
    total_revenue: totalSales[0].total_revenue || 0,
    total_items_sold: totalSales[0].total_items_sold || 0,
    average_bill_value: totalSales[0].average_bill_value || 0,
    today_bills: todayBills[0].count || 0,
    payment_methods: paymentMethods,
    top_products: topProducts
  };

  res.json({
    success: true,
    data: statistics
  });
});       
// Add this function to your billing.controller.js
exports.getDashboardStatistics = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  
  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  // Get today's date
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  // Get monthly start date
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  // Today's statistics
  const [todayStats] = await db.query(`
    SELECT 
      COUNT(*) as bill_count,
      SUM(total_amount) as total_sales,
      SUM(paid_amount) as collected_amount,
      SUM(due_amount) as due_amount
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
  `, [orgId, todayStart, todayEnd]);

  // Monthly statistics
  const [monthlyStats] = await db.query(`
    SELECT 
      COUNT(*) as bill_count,
      SUM(total_amount) as total_sales,
      SUM(paid_amount) as collected_amount,
      SUM(due_amount) as due_amount,
      AVG(total_amount) as avg_bill_value
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
  `, [orgId, monthStart, monthEnd]);

  // Customer count
  const [customerStats] = await db.query(`
    SELECT 
      COUNT(DISTINCT customer_phone) as total_customers,
      COUNT(DISTINCT CASE WHEN created_at BETWEEN ? AND ? THEN customer_phone END) as new_customers
    FROM bills 
    WHERE org_id = ? 
      AND customer_phone IS NOT NULL
  `, [monthStart, monthEnd, orgId]);

  // Product count (if you have a products table)
  const [productStats] = await db.query(`
    SELECT 
      COUNT(*) as total_products,
      SUM(stock_quantity) as total_stock
    FROM products 
    WHERE org_id = ? 
      AND is_active = TRUE
  `, [orgId]);

  // Payment method distribution for today
  const [paymentStats] = await db.query(`
    SELECT 
      payment_method,
      COUNT(*) as count
    FROM bills 
    WHERE org_id = ? 
      AND created_at BETWEEN ? AND ?
    GROUP BY payment_method
  `, [orgId, todayStart, todayEnd]);

  // Daily sales for last 7 days (for chart)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const [dailySales] = await db.query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as bill_count,
      SUM(total_amount) as daily_sales,
      SUM(paid_amount) as daily_collected
    FROM bills 
    WHERE org_id = ? 
      AND created_at >= ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 7
  `, [orgId, sevenDaysAgo]);

  // Top selling products
  const [topProducts] = await db.query(`
    SELECT 
      p.product_name,
      p.sku,
      c.category_name,
      SUM(bi.quantity) as total_quantity,
      SUM(bi.total_price) as total_revenue,
      COUNT(DISTINCT b.bill_id) as bill_count
    FROM bill_items bi
    JOIN products p ON bi.product_id = p.product_id
    JOIN bills b ON bi.bill_id = b.bill_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    WHERE b.org_id = ? 
      AND b.created_at BETWEEN ? AND ?
    GROUP BY p.product_id, p.product_name, p.sku, c.category_name
    ORDER BY total_quantity DESC
    LIMIT 5
  `, [orgId, monthStart, monthEnd]);

  // Recent bills
  const [recentBills] = await db.query(`
    SELECT 
      bill_id,
      bill_number,
      customer_name,
      total_amount,
      paid_amount,
      due_amount,
      payment_method,
      payment_status,
      created_at
    FROM bills 
    WHERE org_id = ? 
    ORDER BY created_at DESC
    LIMIT 5
  `, [orgId]);

  const statistics = {
    today: {
      bill_count: todayStats[0]?.bill_count || 0,
      total_sales: parseFloat(todayStats[0]?.total_sales || 0).toFixed(2),
      collected_amount: parseFloat(todayStats[0]?.collected_amount || 0).toFixed(2),
      due_amount: parseFloat(todayStats[0]?.due_amount || 0).toFixed(2)
    },
    monthly: {
      bill_count: monthlyStats[0]?.bill_count || 0,
      total_sales: parseFloat(monthlyStats[0]?.total_sales || 0).toFixed(2),
      collected_amount: parseFloat(monthlyStats[0]?.collected_amount || 0).toFixed(2),
      due_amount: parseFloat(monthlyStats[0]?.due_amount || 0).toFixed(2),
      avg_bill_value: parseFloat(monthlyStats[0]?.avg_bill_value || 0).toFixed(2)
    },
    customers: {
      total_customers: customerStats[0]?.total_customers || 0,
      new_customers: customerStats[0]?.new_customers || 0
    },
    products: {
      total_products: productStats[0]?.total_products || 0,
      total_stock: productStats[0]?.total_stock || 0
    },
    payment_methods: paymentStats,
    daily_sales: dailySales,
    top_products: topProducts,
    recent_bills: recentBills
  };

  res.json({
    success: true,
    data: statistics
  });
});