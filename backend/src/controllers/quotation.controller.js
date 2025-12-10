const db = require('../config/database');
const asyncHandler = require('express-async-handler');

exports.createQuotation = asyncHandler(async(req,res)=>{
  let {orgId} = req.params
     const {
    customer_name,
    customer_phone,
    customer_address,
    
    gst_percentage,
    gst_amount,
    discount_amount,
    discount_percentage,
    shipping_charges,
    items, // array of quotation items
  } = req.body;

  if (!customer_name  || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Customer name, quotation date and items are required",
    });
}
let discount=0
console.log(items)
  const sub_total = items.reduce((sum, item) => {
    const val = parseFloat(item.total) || 0;
    return sum + val;
  }, 0);
 console.log(sub_total)
 if (discount_amount && !isNaN(discount_amount)) {
    discount = parseFloat(discount_amount);
  } else if (discount_percentage && !isNaN(discount_percentage)) {
    discount = (sub_total * parseFloat(discount_percentage)) / 100;
  }


 let tax = 0;

  if (gst_amount && !isNaN(gst_amount)) {
    tax = parseFloat(formData.gst_amount);
  } else if (gst_percentage && !isNaN(gst_percentage)) {
    tax = (sub_total * parseFloat(gst_percentage)) / 100;
  }
  console.log(sub_total)
// sub_total= parseFloat(sub_total.toFixed(2))
//     discount= parseFloat(discount.toFixed(2))
//     tax= parseFloat(tax.toFixed(2))
//     total= parseFloat(total.toFixed(2))
 
//   let gst_amoun = (sub_total * gst_percentage) / 100;
//   let grand_total = sub_total + gst_amount - discount_amount;
//   console.log(grand_total)
  const total = sub_total - discount + tax +Number(shipping_charges);

const [rows] = await db.query(`INSERT INTO quotations (
 
        org_id,customer_name, customer_mobile, customer_address,
       quotation_date,
       sub_total,gst_rate,gst_amount, 
       discount_rate,discount_amount, shipping_charges, grand_total
     ) 
     VALUES (?,?, ?, ?,  NOW(),  ?,? ,?,?,? ,?,?)`, [
      orgId,
      customer_name,
      customer_phone,
      customer_address,

      sub_total,
      gst_percentage,
      tax,
      discount_percentage,
      discount,
      shipping_charges,
      total,
    ])
console.log(rows)
    const quotationId = rows.insertId;

     // Insert each item into quotation_items table
  for (let item of items) {
    await db.query(
      `
      INSERT INTO quotation_items (
        quotation_id,category_id, product_name, 
        quantity, price, amount
      )
      VALUES (?, ?, ?,?, ?, ?)
      `,
      [
        quotationId,
        item.category_id,
        item.product_name,
        
        item.quantity,
        item.price,
        item.total,
      ]
    );
  }
  res.status(201).json({
    success: true,
    message: "Quotation created successfully",
    quotation_id: quotationId,
  });
  

})

exports.searchQuotations = asyncHandler(async (req, res) => {
  const { search} = req.query;
  const {orgId} = req.params

  let query = `
    SELECT *
    FROM quotations
   WHERE org_id=${orgId}
  `;
  const params = [];

  if (search) {
    query += ` AND (customer_name LIKE ?   )`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm);
  }




  const [products] = await db.query(query, params);

  res.json({
    success: true,
    data: products
  });
});


exports.getQuotations = asyncHandler(async(req,res)=>{
  let {orgId} = req.params
  const [rows] = await db.query(`SELECT * FROM quotations WHERE org_id=${orgId}`)
  if(rows.length==0){
    return res.status(200).json({
      message:"No result found",
      success:true
    })
  }

  return res.status(200).json({
    rows,
    message:"Quotation found successfully",
    success:true
  })

})

exports.downloadQuotations = asyncHandler(async(req,res)=>{
  let {quotationId} = req.params
  const [rows] = await db.query(`SELECT 
  q.*, 
    CONCAT('[', 
        GROUP_CONCAT(
            JSON_OBJECT(
                'item_id', qi.quotation_item_id,
                'product_name', qi.product_name,
                'quantity', qi.quantity,
                'price', qi.price,
                'amount', qi.amount
            )
        ),
    ']') AS items
FROM quotations q
LEFT JOIN quotation_items qi
  ON q.quotation_id = qi.quotation_id
WHERE q.quotation_id = ${quotationId} 
GROUP BY q.quotation_id`)
  
  if(rows.length==0){
    return res.status(200).json({
      message:"No result found",
      success:true
    })
  }

  return res.status(200).json({
    row:rows[0],
    message:"Quotation found successfully",
    success:true
  })

})