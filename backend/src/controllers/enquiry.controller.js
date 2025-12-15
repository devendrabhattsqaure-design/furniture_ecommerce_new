const asyncHandler = require('express-async-handler');
const db = require('../config/database');

exports.createEnquiry=asyncHandler(async(req,res)=>{
    const {name,
    mobile_no,
    followup_date,
    remark,
    address,
    source,
    query,
    }=req.body
    let {orgId} = req.params
    if(!name||!mobile_no||!query){
        return res.status(404).json({
            message:"All feilds are required",
            success:false
        })
    }
    await db.query(
  `INSERT INTO enquiry (
    name,
    mobile_no,
    followup_date,
    remark,
    address,
    source,
    query,
    org_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    name,
    mobile_no,
    followup_date,
    remark,
    address,
    source,
    query,
    orgId
  ]
);


    return res.status(200).json({
        message:"Enquiry send successfully",
        success:true
    })
})


exports.getEnquiry = asyncHandler(async(req,res)=>{
    let {org_id} = req.params
    const [enquiry]=await db.query(`SELECT *
FROM enquiry
WHERE org_id = ${org_id}
ORDER BY created_at DESC;`)
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

exports.updateEnquiry = asyncHandler(async(req,res)=>{
    let {id} = req.params
    let {name,mobile_no,address,source,followup_date,query} = req.body

    let [enquirys] = await db.query(`SELECT * FROM enquiry where enquiry_id=${id}`)

    if(enquirys.length===0){
        return res.status(404).json({
            message:"No Enquiry Found",
            success:false
        })
    }
    let enquiry= enquirys[0]

    await db.query(`UPDATE enquiry SET 
        name=?,mobile_no=?,address=?,source=?,followup_date=?,query=?
        where enquiry_id=${id}
        `,[
            name||enquiry.name,
            mobile_no||enquiry.mobile_no,
            address||enquiry.address,
            source||enquiry.source,
            followup_date||enquiry.followup_date,
            query||enquiry.query,

        ])

        return res.status(200).json({
            message:"Enquiry updated successfully",
            success:true
        })



})
