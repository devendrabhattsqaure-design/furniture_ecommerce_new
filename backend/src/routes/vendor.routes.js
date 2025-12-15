const express = require('express')
const { createVendor, updateVendor, getAllVendors, deleteVendor, getVendor, getVendorItems } = require('../controllers/vendor.controller')
const router = express.Router()

router.post('/create',createVendor)
router.put('/update/:id',updateVendor)
router.get('/:org_id',getAllVendors)
router.get('/single/:id',getVendor)
router.get('/vendor-items/:id',getVendorItems)
router.delete('/delete/:id',deleteVendor)


module.exports = router