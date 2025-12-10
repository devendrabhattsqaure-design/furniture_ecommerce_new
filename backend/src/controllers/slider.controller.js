const asyncHandler = require('express-async-handler');
const db = require('../config/database');
const { deleteImage } = require('../config/cloudinary');

exports.createSlider=asyncHandler(async(req,res)=>{
    const {title,description}=req.body
    // console.log(title)
    // console.log(description)

    const featured_image =req.file?req.file.path:null;
    if(!title||!description){
        return res.status(400).json({
            message:"All feilds are required",
            success:false
        })
    }
// console.log(featured_image)
   const[result]= await db.query(`INSERT INTO banner_sliders
        (org_id,title,image_url,description) VALUES(?,?,?,?)`,
        [2,title,featured_image,description])
        console.log(result)
    return res.status(200).json({
        message:"Slider created successfully",
        success:true
    })

})

exports.getSlider = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const [slider]=await db.query(`SELECT * FROM banner_sliders WHERE org_id=${id}`)
    // console.log(slider)
    return res.status(200).json({
        sliders:slider,
        message:"Silder found successfully",
        success:true
    })
})

exports.getSliderById = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const [slider]=await db.query(`SELECT * FROM banner_sliders WHERE banner_id=${id}`)
    // console.log(slider)
    return res.status(200).json({
        sliders:slider[0],
        message:"Silder found successfully",
        success:true
    })
})

exports.editSlider=asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const {title,description} = req.body
    // console.log(title)
    const [slider] = await db.query(`SELECT * FROM banner_sliders WHERE banner_id=${id}`)
    if(slider.length===0){
        return res.status(404).json({
            message:"Slider not found",
            success:false
        })
    }
    let existingBanner=slider[0];

    const featured_image = req.file?req.file.path:slider[0].image_url;
    await db.query(`UPDATE banner_sliders SET
       title=?,description=?,image_url=?
         WHERE banner_id = ${id}`,[
            title||existingBanner.title,
            description||existingBanner.description,
            featured_image||existingBanner.image_url
         ])
    return res.status(200).json({
        message:"Slider updated successfully",
        success:true
    })

})

exports.deleteSliderById = asyncHandler(async(req,res)=>{
    const {id} = req.params;
     const [slider] = await db.query(`SELECT * FROM banner_sliders WHERE banner_id=${id}`)
    if(slider.length===0){
        return res.status(404).json({
            message:"Slider not found",
            success:false
        })
    }
    let existingBanner=slider[0];
     if (existingBanner.image_url) {
        try {
          const publicId = extractPublicId(existingBanner.image_url);
          await deleteImage(publicId);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
   
    await db.query(`DELETE FROM banner_sliders WHERE banner_id=${id}`)
    // console.log(slider)
    return res.status(200).json({
        
        message:"Slider delete successfully",
        success:true
    })
})