// backend/src/controllers/admin/order.controller.js
const db = require('../../config/database');
const asyncHandler = require('express-async-handler');

// @desc    Get all orders (Admin) - Filtered by org_id
// @route   GET /api/admin/orders
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const offset = (page - 1) * limit;
  const orgId = req.user.org_id; // Get org_id from authenticated user

  let query = `
    SELECT 
     * FROM orders
    WHERE org_id = ?  -- Filter by organization ID
  `;
  const params = [orgId];

  if (status && status !== 'all') {
    query += ' AND order_status = ?';
    params.push(status);
  }
  if (search) {
    query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const [orders] = await db.query(query, params);

  // Get order items for each order
  for (let order of orders) {
    const [items] = await db.query(`
      SELECT 
        oi.*,
        p.product_name,
        p.sku,
        pi.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
      WHERE oi.order_id = ?
    `, [order.order_id]);
    
    order.items = items;
  }

  // Get total count with org filter
  let countQuery = `
    SELECT COUNT(*) as total 
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    WHERE o.org_id = ?
  `;
  const countParams = [orgId];
  
  if (status && status !== 'all') {
    countQuery += ' AND o.order_status = ?';
    countParams.push(status);
  }
  if (search) {
    countQuery += ' AND (o.order_number LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [countResult] = await db.query(countQuery, countParams);
  const total = countResult[0].total;

  res.json({
    success: true,
    orders: orders,
    organization: {
      id: orgId,
      name: orders.length > 0 ? orders[0].organization_name : 'N/A'
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Update order status (with org validation)
// @route   PUT /api/admin/orders/:orderId/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;
  const orgId = req.user.org_id; // Get org_id from authenticated user

  // Check if order exists and belongs to user's organization
  const [orders] = await db.query(
    'SELECT * FROM orders WHERE order_id = ? AND org_id = ?', 
    [orderId, orgId]
  );
  
  if (orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found or you do not have permission'
    });
  }

  await db.query(
    'UPDATE orders SET order_status = ?, updated_at = NOW() WHERE order_id = ?',
    [status, orderId]
  );

  // Add tracking entry if notes provided
  if (notes) {
    await db.query(
      'INSERT INTO order_tracking (order_id, status, notes, created_by) VALUES (?, ?, ?, ?)',
      [orderId, status, notes, req.user.id]
    );
  }

  res.json({ 
    success: true, 
    message: 'Order status updated successfully' 
  });
});

// @desc    Get single order details (with org validation)
// @route   GET /api/admin/orders/:orderId
exports.getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const orgId = req.user.org_id; // Get org_id from authenticated user

  const [orders] = await db.query(`
    SELECT 
      o.*,
      u.full_name as customer_name,
      u.email as customer_email,
      u.phone as customer_phone,
      ua.address_line1,
      ua.address_line2,
      ua.landmark,
      ua.city,
      ua.state,
      ua.postal_code,
      ua.phone as shipping_phone,
      org.org_name as organization_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    LEFT JOIN user_addresses ua ON o.shipping_address_id = ua.address_id
    LEFT JOIN organizations org ON o.org_id = org.org_id
    WHERE o.order_id = ? AND o.org_id = ?
  `, [orderId, orgId]);

  if (orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found or you do not have permission'
    });
  }

  const order = orders[0];

  // Get order items
  const [items] = await db.query(`
    SELECT 
      oi.*,
      p.product_name,
      p.sku,
      pi.image_url
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.product_id
    LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = 1
    WHERE oi.order_id = ?
  `, [orderId]);

  order.items = items;

  res.json({
    success: true,
    order: order
  });
});

// @desc    Delete order (with org validation)
// @route   DELETE /api/admin/orders/:orderId
exports.deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const orgId = req.user.org_id; // Get org_id from authenticated user

  // Check if order exists and belongs to user's organization
  const [orders] = await db.query(
    'SELECT * FROM orders WHERE order_id = ? AND org_id = ?', 
    [orderId, orgId]
  );
  
  if (orders.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Order not found or you do not have permission'
    });
  }

  // Start transaction
  await db.query('START TRANSACTION');

  try {
    // Delete order items first
    await db.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    
    // Delete order tracking
    await db.query('DELETE FROM order_tracking WHERE order_id = ?', [orderId]);
    
    // Delete the order
    await db.query('DELETE FROM orders WHERE order_id = ?', [orderId]);

    await db.query('COMMIT');

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
});