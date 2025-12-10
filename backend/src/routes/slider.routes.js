const express = require('express')
const { uploadSlider } = require('../config/cloudinary')
const { createSlider, getSlider, getSliderById, editSlider, deleteSliderById } = require('../controllers/slider.controller')

const router=express.Router()

router.post('/add-slider',uploadSlider.single('image_url'),createSlider)
router.get('/:id',getSlider)
router.get('/:id',getSliderById)
router.put('/edit-slider/:id',uploadSlider.single('image_url'),editSlider)
router.delete('/delete-slider/:id',deleteSliderById)

module.exports = router;