const db = require('../config/database');
const asyncHandler = require('express-async-handler');

exports.getCategories = asyncHandler(async(req,res)=>{
  let {orgId} = req.params
   const [result]= await db.query(`SELECT * FROM categories WHERE org_Id=${orgId}` )
   console.log(result)
   
   return res.status(201).json({
    categories:result,
    message:"Categories find successfully",
    success:true
   })
})

exports.getLessStocks = asyncHandler(async(req,res)=>{
  let {orgId} = req.params
  const [rows] = await db.query(`SELECT 
        p.*, 
        c.category_name
     FROM products p 
     JOIN categories c ON p.category_id = c.category_id WHERE p.org_id=${orgId} AND p.stock_quantity<=10`)
 
  return res.status(200).json({
    data:rows,
    success:true
  })
})

exports.getStocks = asyncHandler(async (req, res) => {
  let {orgId} = req.params
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const category = req.query.category || null;
  const minQty = req.query.minQty || null;
  const maxQty = req.query.maxQty || null;

  let where = `WHERE 1=1 AND  p.org_id=${orgId} `;
  let params = [];

  if (category) {
    where += " AND p.category_id = ? ";
    params.push(category);
  }

  if (minQty) {
    where += " AND p.stock_quantity >= ? ";
    params.push(minQty);
  }

  if (maxQty) {
    where += " AND p.stock_quantity <= ? ";
    params.push(maxQty);
  }

  
const [result] = await db.query(`SELECT COUNT(*) AS totalProducts FROM products WHERE org_id=${orgId}`)
const [categoryResult] = await db.query(`SELECT COUNT(*) AS totalCategory FROM categories WHERE org_id=${orgId}`)

const [lessProducts] = await db.query(`SELECT COUNT(*) AS total FROM products  WHERE org_id=${orgId} AND stock_quantity <= ? `,[10])

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM products p ${where}`,
    params
  );

  const total = countRows[0].total;
  const totalPages = Math.ceil(total / limit);

  // Main query
  let rows=[]
 if(category||minQty||maxQty){
  rows= await db.query(
    `
     SELECT 
        p.*, 
        c.category_name
     FROM products p
     JOIN categories c ON p.category_id = c.category_id
     ${where}
     ORDER BY p.product_id DESC
     LIMIT ? OFFSET ?
    `,
    [params, limit, offset]
  );
  if(rows.length==0){
    return res.status(200).json({
      message:"NO Stocks Found",success:true
    })
  }
  res.json({
    success: true,
    page,
    totalPages,
    data: rows,
     totalProducts:result[0].totalProducts,
    totalCategory:categoryResult[0].totalCategory,
    minimumStock:lessProducts[0].total
  });
 }

 rows = await db.query(`SELECT 
        p.*, 
        c.category_name
     FROM products p
     JOIN categories c ON p.category_id = c.category_id 
     WHERE p.org_id=${orgId}
     ORDER BY p.product_id DESC
     LIMIT ? OFFSET ?`,[limit,offset])

      return res.json({
    success: true,
    page,
   totalProducts:result[0].totalProducts,
    totalCategory:categoryResult[0].totalCategory,
    totalPages,
    data: rows,
    minimumStock:lessProducts[0].total,
  });
 })





