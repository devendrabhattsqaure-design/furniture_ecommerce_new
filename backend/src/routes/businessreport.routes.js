const express = require('express');
const router = express.Router();
const {
  getBusinessReport,
  exportBusinessReport,
  getOverdueBills,
  getSalesTrend,
  getTopCustomers,
  getPayments,
  recordPayment
} = require('../controllers/businessreport.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// All routes require authentication and admin/super_admin access
router.use(protect);
router.use(authorize('super_admin', 'admin'));

// Main business report route
router.get('/', getBusinessReport);

// Export to Excel
router.get('/export', exportBusinessReport);

// Overdue bills
router.get('/overdue', getOverdueBills);

// Sales trend analysis
router.get('/sales-trend', getSalesTrend);

// Top customers
router.get('/top-customers', getTopCustomers);
router.post('/payments', protect, authorize('super_admin', 'admin', 'staff'), recordPayment);
router.get('/payments', protect, authorize('super_admin', 'admin', 'staff'), getPayments);

module.exports = router;