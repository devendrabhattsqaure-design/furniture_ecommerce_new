const db = require('../config/database');
const asyncHandler = require('express-async-handler');
const { format } = require('date-fns');

// Helper to get organization ID
const getOrgId = (req) => {
  return req.user?.org_id || req.headers['x-org-id'] || null;
};

// @desc    Record a payment
// @route   POST /api/payments
exports.recordPayment = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const {
    bill_id,
    bill_number,
    customer_name,
    customer_phone,
    payment_amount,
    previous_due,
    new_due,
    payment_method = 'cash',
    notes,
    created_by
  } = req.body;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  if (!bill_id || !payment_amount || !customer_name) {
    return res.status(400).json({
      success: false,
      message: 'Bill ID, payment amount and customer name are required'
    });
  }

  try {
    // Insert payment record
    const [result] = await db.query(`
      INSERT INTO payments (
        org_id, bill_id, bill_number, customer_name, customer_phone,
        payment_amount, previous_due, new_due, payment_method, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orgId, bill_id, bill_number, customer_name, customer_phone,
      payment_amount, previous_due, new_due, payment_method, notes, created_by || req.user?.user_id
    ]);

    // Fetch the created payment record
    const [payment] = await db.query(`
      SELECT p.*, u.full_name as collected_by_name 
      FROM payments p
      LEFT JOIN users u ON p.created_by = u.user_id
      WHERE p.payment_id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment[0]
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment'
    });
  }
});

// @desc    Get all payments with filters
// @route   GET /api/payments
exports.getPayments = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const {
    customer_name,
    customer_phone,
    start_date,
    end_date,
    payment_method,
    page = 1,
    limit = 20
  } = req.query;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  let query = `
    SELECT 
      p.*,
      u.full_name as collected_by_name,
      b.total_amount as bill_total_amount
    FROM payments p
    LEFT JOIN users u ON p.created_by = u.user_id
    LEFT JOIN bills b ON p.bill_id = b.bill_id
    WHERE p.org_id = ?
  `;

  const params = [orgId];

  // Apply filters
  if (customer_name) {
    query += ' AND p.customer_name LIKE ?';
    params.push(`%${customer_name}%`);
  }

  if (customer_phone) {
    query += ' AND p.customer_phone LIKE ?';
    params.push(`%${customer_phone}%`);
  }

  if (start_date) {
    query += ' AND DATE(p.payment_date) >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND DATE(p.payment_date) <= ?';
    params.push(end_date);
  }

  if (payment_method) {
    query += ' AND p.payment_method = ?';
    params.push(payment_method);
  }

  // Order and pagination
  query += ' ORDER BY p.payment_date DESC';
  
  const offset = (page - 1) * limit;
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  // Get total count for pagination
  let countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
  countQuery = countQuery.split('ORDER BY')[0]; // Remove ORDER BY clause
  countQuery = countQuery.split('LIMIT')[0]; // Remove LIMIT clause
  
  const [countResult] = await db.query(countQuery, params.slice(0, -2)); // Remove limit and offset for count
  
  const [payments] = await db.query(query, params);

  // Get summary statistics
  const [summary] = await db.query(`
    SELECT 
      COUNT(*) as total_payments,
      SUM(payment_amount) as total_amount,
      COUNT(DISTINCT customer_phone) as unique_customers,
      COUNT(DISTINCT payment_method) as payment_methods_used
    FROM payments 
    WHERE org_id = ?
      ${start_date ? ' AND DATE(payment_date) >= ?' : ''}
      ${end_date ? ' AND DATE(payment_date) <= ?' : ''}
  `, [orgId, ...(start_date ? [start_date] : []), ...(end_date ? [end_date] : [])]);

  res.json({
    success: true,
    data: {
      payments: payments.map(payment => ({
        ...payment,
        payment_amount: parseFloat(payment.payment_amount).toFixed(2),
        previous_due: parseFloat(payment.previous_due).toFixed(2),
        new_due: parseFloat(payment.new_due).toFixed(2),
        bill_total_amount: payment.bill_total_amount ? parseFloat(payment.bill_total_amount).toFixed(2) : null
      })),
      summary: {
        total_payments: summary[0]?.total_payments || 0,
        total_amount: parseFloat(summary[0]?.total_amount || 0).toFixed(2),
        unique_customers: summary[0]?.unique_customers || 0,
        payment_methods_used: summary[0]?.payment_methods_used || 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0]?.total || 0,
        totalPages: Math.ceil((countResult[0]?.total || 0) / limit)
      }
    }
  });
});

// @desc    Get payments by customer
// @route   GET /api/payments/customer/:customerPhone
exports.getPaymentsByCustomer = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { customerPhone } = req.params;
  const { start_date, end_date } = req.query;

  if (!orgId || !customerPhone) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID and customer phone are required'
    });
  }

  let query = `
    SELECT 
      p.*,
      u.full_name as collected_by_name,
      b.bill_number,
      b.total_amount,
      b.due_amount as current_due
    FROM payments p
    LEFT JOIN users u ON p.created_by = u.user_id
    LEFT JOIN bills b ON p.bill_id = b.bill_id
    WHERE p.org_id = ? AND p.customer_phone = ?
  `;

  const params = [orgId, customerPhone];

  if (start_date) {
    query += ' AND DATE(p.payment_date) >= ?';
    params.push(start_date);
  }

  if (end_date) {
    query += ' AND DATE(p.payment_date) <= ?';
    params.push(end_date);
  }

  query += ' ORDER BY p.payment_date DESC';

  const [payments] = await db.query(query, params);

  // Get customer summary
  const [customerSummary] = await db.query(`
    SELECT 
      customer_name,
      customer_phone,
      COUNT(DISTINCT bill_id) as total_bills,
      SUM(payment_amount) as total_paid,
      MIN(payment_date) as first_payment_date,
      MAX(payment_date) as last_payment_date
    FROM payments 
    WHERE org_id = ? AND customer_phone = ?
    GROUP BY customer_name, customer_phone
  `, [orgId, customerPhone]);

  res.json({
    success: true,
    data: {
      customer: customerSummary[0] || null,
      payments: payments.map(payment => ({
        ...payment,
        payment_amount: parseFloat(payment.payment_amount).toFixed(2),
        previous_due: parseFloat(payment.previous_due).toFixed(2),
        new_due: parseFloat(payment.new_due).toFixed(2),
        total_amount: payment.total_amount ? parseFloat(payment.total_amount).toFixed(2) : null,
        current_due: payment.current_due ? parseFloat(payment.current_due).toFixed(2) : null
      })),
      summary: {
        total_payments: payments.length,
        total_amount: payments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0).toFixed(2),
        average_payment: (payments.reduce((sum, p) => sum + parseFloat(p.payment_amount), 0) / payments.length || 0).toFixed(2)
      }
    }
  });
});

// @desc    Get payment summary for business report
// @route   GET /api/payments/summary
exports.getPaymentSummary = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { period = 'today' } = req.query;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
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

  // Daily payment trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dailyTrend] = await db.query(`
    SELECT 
      DATE(payment_date) as payment_date,
      COUNT(*) as payment_count,
      SUM(payment_amount) as daily_total,
      COUNT(DISTINCT customer_phone) as daily_customers
    FROM payments 
    WHERE org_id = ? 
      AND payment_date >= ?
    GROUP BY DATE(payment_date)
    ORDER BY payment_date DESC
    LIMIT 30
  `, [orgId, thirtyDaysAgo]);

  // Payment method distribution
  const [methodDistribution] = await db.query(`
    SELECT 
      payment_method,
      COUNT(*) as payment_count,
      SUM(payment_amount) as total_amount,
      AVG(payment_amount) as average_amount
    FROM payments 
    WHERE org_id = ? 
      AND payment_date BETWEEN ? AND ?
    GROUP BY payment_method
    ORDER BY total_amount DESC
  `, [orgId, startDate, endDate]);

  // Top paying customers
  const [topCustomers] = await db.query(`
    SELECT 
      customer_name,
      customer_phone,
      COUNT(*) as payment_count,
      SUM(payment_amount) as total_paid,
      MAX(payment_date) as last_payment_date
    FROM payments 
    WHERE org_id = ? 
      AND payment_date BETWEEN ? AND ?
    GROUP BY customer_phone, customer_name
    ORDER BY total_paid DESC
    LIMIT 10
  `, [orgId, startDate, endDate]);

  // Total summary
  const [summary] = await db.query(`
    SELECT 
      COUNT(*) as total_payments,
      SUM(payment_amount) as total_amount,
      COUNT(DISTINCT customer_phone) as unique_customers,
      AVG(payment_amount) as average_payment,
      MIN(payment_date) as first_payment_date,
      MAX(payment_date) as last_payment_date
    FROM payments 
    WHERE org_id = ? 
      AND payment_date BETWEEN ? AND ?
  `, [orgId, startDate, endDate]);

  res.json({
    success: true,
    data: {
      period: {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      },
      summary: {
        total_payments: summary[0]?.total_payments || 0,
        total_amount: parseFloat(summary[0]?.total_amount || 0).toFixed(2),
        unique_customers: summary[0]?.unique_customers || 0,
        average_payment: parseFloat(summary[0]?.average_payment || 0).toFixed(2),
        first_payment_date: summary[0]?.first_payment_date || null,
        last_payment_date: summary[0]?.last_payment_date || null
      },
      daily_trend: dailyTrend.map(day => ({
        ...day,
        daily_total: parseFloat(day.daily_total || 0).toFixed(2)
      })),
      method_distribution: methodDistribution.map(method => ({
        ...method,
        total_amount: parseFloat(method.total_amount || 0).toFixed(2),
        average_amount: parseFloat(method.average_amount || 0).toFixed(2)
      })),
      top_customers: topCustomers.map(customer => ({
        ...customer,
        total_paid: parseFloat(customer.total_paid || 0).toFixed(2)
      }))
    }
  });
});

// @desc    Delete a payment (admin only)
// @route   DELETE /api/payments/:id
exports.deletePayment = asyncHandler(async (req, res) => {
  const orgId = getOrgId(req);
  const { id } = req.params;

  if (!orgId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required'
    });
  }

  const [payment] = await db.query(`
    SELECT * FROM payments 
    WHERE payment_id = ? AND org_id = ?
  `, [id, orgId]);

  if (!payment.length) {
    return res.status(404).json({
      success: false,
      message: 'Payment not found'
    });
  }

  await db.query(`
    DELETE FROM payments WHERE payment_id = ? AND org_id = ?
  `, [id, orgId]);

  res.json({
    success: true,
    message: 'Payment deleted successfully'
  });
});