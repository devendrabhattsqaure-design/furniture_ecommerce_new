const asyncHandler = require('express-async-handler');
const db = require('../config/database');

exports.createExpense= asyncHandler(async(req,res)=>{
  let {orgId} = req.params
    const {expense_date,
      vendor_id ,
      amount,
      vendor_item,
      paid_by,
      category,
      service,
      payment_method,
      transaction_type,
      description,}=req.body
     
    const featured_image =req.file?req.file.path:null;
    let expenseDate = expense_date;   // "2025-12-03"
// console.log(orgId)
// Add "T00:00:00" so JS does NOT convert it to UTC
expenseDate = new Date(expenseDate + "T00:00:00");
    
    
    const [result] = await db.query(
        `INSERT INTO expenses (
          org_Id,expense_date,
      vendor_id ,
      amount,
      vendor_item,
      paid_by,
      category,
      service,
      payment_method,
      transaction_type,
      description,
      bill_image
          
        ) VALUES (?,?, ?, ?,?, ?, ?, ?, ?,?,?,?)`,
        [
          orgId,
          expense_date,
      vendor_id ,
      amount,
      vendor_item,
      paid_by,
      category,
      service,
      payment_method,
      transaction_type,
      description,
      featured_image||"No image"
          
        ]
      );
      if(vendor_item){
     let [items]=await db.query(`SELECT * FROM vendors_items where vendor_items_id=${vendor_item}`) 
    if(items.length===0){
      return res.status(404).json({
        message:"No Items Found",
        success:false
      })
    }
    let item = items[0]
    let dueAmount = item.product_due-amount
    db.query(`UPDATE vendors_items SET product_due=? where vendor_items_id=${vendor_item} `,[
      dueAmount
    ])
      }
   
      res.status(201).json({
        message:"Expense created successfully",
        success:true
      })
})

function addOneDay(sqlDate) {
  const d = new Date(sqlDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0]; // returns YYYY-MM-DD
}


exports.getOneExpense = asyncHandler(async(req,res)=>{
  let {id} = req.params
  const [expenses] = await db.query(
  `SELECT 
      e.*,
      v.vendor_name,
      v.vendor_number,
      v.vendor_address,
      v.vendor_gstno,
      vi.product_name,
     
      vi.product_price
  FROM expenses e
  LEFT JOIN vendors v 
      ON e.vendor_id = v.vendor_id
  LEFT JOIN vendors_items vi
      ON e.vendor_id = vi.vendor_id
  WHERE e.id = ?
  ORDER BY e.expense_date DESC
  `,
  [id]
);
let expense = expenses[0]
return res.status(200).json({
  expense,
  message:"Expense found successfully",
  success:true
})
})

exports.getExpenses= asyncHandler(async(req,res)=>{
  let {orgId} =req.params
  let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
     const offset = (page - 1) * limit;
     const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM expenses WHERE org_Id=${orgId}`
    );

    const total = countResult[0].total;
    // console.log(total,'total')
    
    const totalPages = Math.ceil(total / limit);
    const [expenses]=   await db.query(
      `SELECT 
    e.*,
      v.vendor_name,
    v.vendor_number,
    v.vendor_address,
    v.vendor_gstno
  FROM expenses e
  LEFT JOIN vendors v 
    ON e.vendor_id = v.vendor_id
  WHERE e.org_id = ?
  ORDER BY e.expense_date DESC
  LIMIT ? OFFSET ?
  `,
  [orgId, limit, offset],
      
    );
     const updatedRows = expenses.map((item) => ({
      ...item,
      expense_date: addOneDay(item.expense_date),
    }));
    // console.log(updatedRows,'yfyjhf');
    
    if(!expenses){
        return res.status(404).json({
            message:"No expenses found",
            success:false
        })
    }
    // console.log(data,'data');
    const [rows] = await db.query(
  `SELECT SUM(amount) AS today_total
   FROM expenses
   WHERE DATE(expense_date) = CURDATE()
   AND org_id = ?`,
  [orgId]
);
const selectedMonth =  new Date().getMonth() + 1; // JS month is 0 based
const selectedYear  = new Date().getFullYear();

const [row] = await db.query(
  `SELECT SUM(amount) AS month_total
   FROM expenses
   WHERE MONTH(expense_date) = ? 
   AND YEAR(expense_date) = ?
   AND org_id = ?`,
  [selectedMonth, selectedYear, orgId]
);

const monthTotal = row[0].month_total || 0;

const todayTotal = rows[0].today_total || 0;
    return res.status(201).json({
        data:updatedRows,
        total,
        totalPages,
        message:"Expenses found",
        todayTotal,
        monthTotal,
        success:true
    })
})


exports.editExpense=asyncHandler(async(req,res)=>{

    const expense_id=req.params.id
    const [expenses] = await db.query(`SELECT * FROM expenses WHERE  id=? `,[expense_id]);
    // console.log(expense)
    if(!expenses.length===0){
        return res.status(404).json({
            message:"Expense not found",
            success:false
        })
    }
    const expense=expenses[0];
  
    // console.log(expense)
    const featured_image =req.file?req.file.path:null;
    let {expense_date,
      vendor_id ,
      amount,
      vendor_item,
      paid_by,
      category,
      service,
      payment_method,
      transaction_type,
      description,}=req.body
      
// let sqlDate = expense_date;
//     if (expense_date.includes("-") && expense_date.split("-")[0].length === 2) {
//     const [day, month, year] = expense_date.split("-");
//     sqlDate = `${year}-${month}-${day}`;  
// }

    await db.query(
  `UPDATE expenses SET
    expense_date = ?,
    vendor_id = ?,
    amount = ?,
    vendor_item=?,
    paid_by = ?,
    category = ?,
    service = ?,
    payment_method = ?,
    transaction_type = ?,
    description = ?,
    bill_image = ?
   WHERE id = ?`,
  [
    expense_date || expense.expense_date,
    vendor_id || expense.vendor_id,
    amount || expense.amount,
    vendor_item || expense.vendor_item,
    paid_by || expense.paid_by,
    category || expense.category,
    service || expense.service,
    payment_method || expense.payment_method,
    transaction_type || expense.transaction_type,
    description || expense.description,
    featured_image || expense.bill_image,
    expense_id
  ]
);


    return res.status(200).json({
        message:"Expense updated successfully",
        success:true
    })
})


exports.deleteExpense=asyncHandler(async(req,res)=>{
    const {id}=req.params
     const [expenses] = await db.query('SELECT * FROM expenses WHERE id = ?', [id]);
      if (expenses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'expense not found'
        });
      }
      let expense=expenses[0]
    await db.query(`DELETE FROM expenses WHERE id=? `,[id])

    return res.status(200).json({
        message:"Expense deleted successfully",
        success:true
    })
})

exports.filterExpense=asyncHandler(async(req,res)=>{
 const { fromDate, toDate, search } = req.query;
const { orgId } = req.params;

let page = Number(req.query.page) || 1;
let limit = Number(req.query.limit) || 10;
const offset = (page - 1) * limit;

/* ---------------- WHERE CLAUSE ---------------- */
let whereClause = ` WHERE org_id = ? `;
let params = [orgId];

// 📅 Date Filter
if (fromDate && toDate) {
  whereClause += ` AND expense_date BETWEEN ? AND ? `;
  params.push(fromDate, toDate);
} else if (fromDate) {
  whereClause += ` AND expense_date >= ? `;
  params.push(fromDate);
} else if (toDate) {
  whereClause += ` AND expense_date <= ? `;
  params.push(toDate);
}

// 🔍 Search Filter
if (search && search.trim() !== "") {
  whereClause += `
    AND (vendor_name LIKE ? OR paid_by LIKE ?)
  `;
  params.push(`%${search}%`, `%${search}%`);
}

/* ---------------- COUNT QUERY ---------------- */
const [countResult] = await db.query(
  `SELECT COUNT(*) AS total FROM expenses ${whereClause}`,
  params
);

const total = countResult[0].total;
const totalPages = Math.ceil(total / limit);

/* ---------------- DATA QUERY ---------------- */
const [rows] = await db.query(
  `SELECT *
   FROM expenses
   ${whereClause}
   ORDER BY expense_date DESC
   LIMIT ? OFFSET ?`,
  [...params, limit, offset]
);

const updatedRows = rows.map((item) => ({
  ...item,
  expense_date: addOneDay(item.expense_date),
}));

/* ---------------- TOTAL AMOUNT (FROM–TO) ---------------- */
let totalParams = [orgId];
let totalWhere = ` WHERE org_id = ? `;

if (fromDate && toDate) {
  totalWhere += ` AND expense_date BETWEEN ? AND ? `;
  totalParams.push(fromDate, toDate);
} else if (fromDate) {
  totalWhere += ` AND expense_date >= ? `;
  totalParams.push(fromDate);
} else if (toDate) {
  totalWhere += ` AND expense_date <= ? `;
  totalParams.push(toDate);
}

const [totalRow] = await db.query(
  `SELECT SUM(amount) AS total_amount
   FROM expenses
   ${totalWhere}`,
  totalParams
);

const totalAmount = totalRow[0].total_amount || 0;

/* ---------------- RESPONSE ---------------- */
res.status(200).json({
  success: true,
  totalAmount,        // ✅ from–to total
  data: updatedRows,
  totalPages,
  page,
});


})


exports.getVendorExpenses= asyncHandler(async(req,res)=>{
  let {id} =req.params
  
    const [expenses]=   await db.query(
      `SELECT 
    e.*,
      v.vendor_name,
    v.vendor_number,
    v.vendor_address,
    v.vendor_gstno
  FROM expenses e
  LEFT JOIN vendors v 
    ON e.vendor_id = v.vendor_id
  WHERE e.vendor_id = ?
  ORDER BY e.expense_date DESC
  
  `,
  [id],
      
    );
     const updatedRows = expenses.map((item) => ({
      ...item,
      expense_date: addOneDay(item.expense_date),
    }));
    // console.log(updatedRows,'yfyjhf');
    
    if(!expenses){
        return res.status(404).json({
            message:"No expenses found",
            success:false
        })
    }
    // console.log(data,'data');
 
// const selectedMonth =  new Date().getMonth() + 1; // JS month is 0 based
// const selectedYear  = new Date().getFullYear();

const [row] = await db.query(
  `SELECT SUM(amount) AS total
   FROM expenses
   WHERE vendor_id = ? 
  `,
  [id]
);

const total = row[0].total || 0;

// const todayTotal = rows[0].today_total || 0;
    return res.status(201).json({
        data:updatedRows,
        total,
        message:"Expenses found",
        
        success:true
    })
})