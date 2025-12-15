// billing.routes.js
const express = require('express');
const router = express.Router();
const {
  createBill,
  getAllBills,
  getBill,
  searchProducts,
  getBillingStatistics,updatePayment,getDashboardStatistics,verifyBillFromQR
} = require('../controllers/billing.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
router.get('/verify/:id', verifyBillFromQR);
router.post('/', protect, createBill);
router.get('/', protect, getAllBills);
router.get('/statistics', protect, getBillingStatistics);
router.get('/products/search', protect, searchProducts);
router.get('/:id', protect, getBill);

router.put('/:id/payment', protect, updatePayment); // Add this route
router.get('/dashboard', protect, getDashboardStatistics);

module.exports = router;