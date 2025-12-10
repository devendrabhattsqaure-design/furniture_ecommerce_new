const express = require('express')
const { createEnquiry, getEnquiry, getEnquiryById, deleteEnquiryById } = require('../controllers/enquiry.controller')
const router = express.Router()

router.post('/create-enquiry/:orgId',createEnquiry)
router.get('/:org_id',getEnquiry)
router.get('/:id',getEnquiryById)
router.delete('/delete/:id',deleteEnquiryById)

module.exports=router