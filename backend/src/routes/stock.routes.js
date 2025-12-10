const express = require('express')
const { getStocks, getCategories, getLessStocks } = require('../controllers/stock.controller')

const router = express.Router()

router.get('/:orgId',getStocks)
router.get('/categories/:orgId',getCategories)
router.get('/less-stock/:orgId',getLessStocks)

module.exports = router