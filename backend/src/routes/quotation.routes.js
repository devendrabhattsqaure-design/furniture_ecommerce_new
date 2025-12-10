const express = require('express')
const {
  createQuotation,
  getQuotations,
  searchQuotations,
  downloadQuotations
} = require('../controllers/quotation.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router()

router.post('/create/:orgId',  createQuotation)
router.get('/:orgId',getQuotations)
router.get('/search-quotation/:orgId',searchQuotations)
router.get('/download/:quotationId',downloadQuotations)

module.exports = router