const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPayments,
  getPaymentsByCustomer,
  getPaymentSummary,
  deletePayment
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

// Record payment
router.post('/', authorize('super_admin', 'admin', 'staff'), recordPayment);

// Get all payments with filters
router.get('/', authorize('super_admin', 'admin', 'staff'), getPayments);

// Get payments by customer
router.get('/customer/:customerPhone', authorize('super_admin', 'admin', 'staff'), getPaymentsByCustomer);

// Get payment summary for business report
router.get('/summary', authorize('super_admin', 'admin', 'staff'), getPaymentSummary);

// Delete payment (admin only)
router.delete('/:id', authorize('super_admin', 'admin'), deletePayment);

module.exports = router;