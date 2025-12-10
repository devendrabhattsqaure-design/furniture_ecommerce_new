const asyncHandler = require('express-async-handler');
const db = require('../config/database');

exports.createEnquiry=asyncHandler(async(req,res)=>{
    const {name,mobile_no,remark,followup_date}=req.body
    let {orgId} = req.params
    if(!name||!mobile_no||!remark){
        return res.status(404).json({
            message:"All feilds are required",
            success:false
        })
    }
    await db.query(`INSERT INTO enquiry (name,mobile_no,remark,followup_date,org_id)  VALUES(?,?,?,?,?)`,[
        name,mobile_no,remark,followup_date,orgId
    ])

    return res.status(200).json({
        message:"Enquiry send successfully",
        success:true
    })
})


exports.getEnquiry = asyncHandler(async(req,res)=>{
    let {org_id} = req.params
    const [enquiry]=await db.query(`SELECT * FROM enquiry WHERE org_id=${org_id}`)
    // console.log(slider)
      if(enquiry.length===0){
        return res.status(404).json({
            message:"enquiry not found",
            success:false
        })
    }
    return res.status(200).json({
        enquiry,
        message:"enquiry found successfully",
        success:true
    })
})

exports.getEnquiryById = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const [enquiry]=await db.query(`SELECT * FROM enquiry WHERE enquiry_id=${id}`)
      if(enquiry.length===0){
        return res.status(404).json({
            message:"enquiry not found",
            success:false
        })
    }
    // console.log(slider)
    return res.status(200).json({
        enquiry:enquiry[0],
        message:"enquiry found successfully",
        success:true
    })
})

exports.deleteEnquiryById = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const [enquiry]=await db.query(`SELECT * FROM enquiry WHERE enquiry_id=${id}`)
      if(enquiry.length===0){
        return res.status(404).json({
            message:"enquiry not found",
            success:false
        })
    }

     await db.query(`DELETE FROM enquiry WHERE enquiry_id=${id}`)
    // console.log(slider)
    return res.status(200).json({
       
        message:"enquiry delete successfully",
        success:true
    })
})
