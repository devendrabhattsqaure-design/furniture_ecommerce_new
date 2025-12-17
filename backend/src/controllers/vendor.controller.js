const db = require('../config/database');
const asyncHandler = require('express-async-handler');

exports.createVendor = asyncHandler(async(req,res)=>{
    try {
        let {vendor_name,vendor_number,vendor_address,vendor_gstno,org_id} = req.body
        if(!vendor_name||!vendor_number){
            return res.status(400).json({
                message:"All feilds are required",
                success:false
            })
        }
console.log(req.body)
       let ress= await db.query(`INSERT INTO vendors (vendor_name,vendor_number,vendor_address,vendor_gstno,org_id)
        VALUES(?,?,?,?,?)
        `,[
            vendor_name,vendor_number,vendor_address,vendor_gstno,org_id
        ])

        return res.status(200).json({
            message:"Vendor created successfully",
            success:true
        })
        
    } catch (error) {
        return res.status(404).json({
            message:error.message,
            success:false
        })
    }
})


exports.updateVendor = asyncHandler(async(req,res)=>{
    let {id} = req.params
    try {
        let {vendor_name,vendor_number,vendor_address,vendor_gstno} = req.body
        console.log(req.body)
        let [vendors] = await db.query(`SELECT * FROM vendors where vendor_id=${id}`)
        if(vendors.length===0){
            return res.status(400).json({
                message:"No vendor found",
                success:false
            })
        }
      let  vendor= vendors[0]
       await db.query(`UPDATE vendors 
SET vendor_name = ?, 
    vendor_number = ?, 
    vendor_address = ?, 
    vendor_gstno = ?
WHERE vendor_id = ${id}
       
        `,[
            vendor_name||vendor.vendor_name,
            vendor_number||vendor.vendor_number,
            vendor_address||vendor.vendor_address,
            vendor_gstno||vendor.vendor_gstno,
            
        ])

        return res.status(200).json({
            message:"Vendor updated successfully",
            success:true
        })
        
    } catch (error) {
        return res.status(404).json({
            message:error.message,
            success:false
        })
    }
})

exports.deleteVendor = asyncHandler(async(req,res)=>{
    let {id} = req.params

    try {
         let [vendors] = await db.query(`SELECT * FROM vendors where vendor_id=${id}`)
        if(vendors.length===0){
            return res.status(400).json({
                message:"No vendor found",
                success:false
            })
        }
        await db.query(`DELETE FROM vendors WHERE vendor_id = ${id}`)
        return res.status(200).json({
            message:"Vendor Deleted successfully",
            success:true
        })
    } catch (error) {
         return res.status(404).json({
            message:error.message,
            success:false
        })
    }
})

exports.getAllVendors= asyncHandler(async(req,res)=>{
    try {
        let {org_id} = req.params
        
        console.log(org_id)
        let [vendors] = await db.query(`SELECT * FROM vendors where org_id=${org_id}`)
         
        if(vendors.length===0){
            return res.status(400).json({
                message:"No vendor found",
                success:false
            })
        }
        return res.status(200).json({
            vendors,
           
            message:"Vendors found successfully",
            success:true
        })
        
    } catch (error) {
         return res.status(404).json({
            message:error.message,
            success:false
        })
    }
})

exports.getVendor= asyncHandler(async(req,res)=>{
    try {
        let {id} = req.params
        

        let [vendor] = await db.query(`SELECT * FROM vendors where vendor_id=${id}`)
         
        if(vendor.length===0){
            return res.status(400).json({
                message:"No vendor found",
                success:false
            })
        }
        return res.status(200).json({
            vendor:vendor[0],
           
            message:"Vendor found successfully",
            success:true
        })
        
    } catch (error) {
         return res.status(404).json({
            message:error.message,
            success:false
        })
    }
})


exports.getVendorItems= asyncHandler(async(req,res)=>{
    try {
        let {id} = req.params
        console.log(id)

        let [vendors] = await db.query(`SELECT * FROM vendors_items where vendor_id=${id}`)
        const [row] = await db.query(
  `SELECT SUM(product_due) AS total
   FROM vendors_items
   WHERE vendor_id = ? 
  `,
  [id]
);

const total = row[0].total || 0;
         
        if(vendors.length===0){
            return res.status(400).json({
                message:"No vendor found",
                success:false
            })
        }
        return res.status(200).json({
            vendors,
           total,
            message:"Vendor Items found successfully",
            success:true
        })
        
    } catch (error) {
         return res.status(404).json({
            message:error.message,
            success:false
        })
    }
})
exports.getVendorDueItems= asyncHandler(async(req,res)=>{
    try {
        let {id} = req.params
        console.log(id)

        let [vendors] = await db.query(`SELECT * FROM vendors_items where vendor_id=${id} AND product_due>0`)
         
        if(vendors.length===0){
            return res.status(400).json({
                message:"No vendor found",
                success:false
            })
        }
        return res.status(200).json({
            vendors,
           
            message:"Vendor Items found successfully",
            success:true
        })
        
    } catch (error) {
         return res.status(404).json({
            message:error.message,
            success:false
        })
    }
})