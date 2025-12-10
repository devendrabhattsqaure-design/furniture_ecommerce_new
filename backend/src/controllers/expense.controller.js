const asyncHandler = require('express-async-handler');
const db = require('../config/database');

exports.createExpense= asyncHandler(async(req,res)=>{
  let {orgId} = req.params
    const {expense_date,main_head,debit,credit,net_balance,added_by}=req.body
    if(!main_head){
        return res.status(400).json({
            message:"All feilds are required",
            success:false
        })
    }
    let expenseDate = expense_date;   // "2025-12-03"
// console.log(orgId)
// Add "T00:00:00" so JS does NOT convert it to UTC
expenseDate = new Date(expenseDate + "T00:00:00");
    
    
    const [result] = await db.query(
        `INSERT INTO expenses (
          org_Id,expense_date,main_head,debit,credit,net_balance,added_by,added_date
          
        ) VALUES (?,?, ?, ?, ?, ?, ?, NOW())`,
        [
          orgId,
          expenseDate,
          main_head,
          debit,
          credit,
          net_balance,
          added_by,
          
        ]
      );

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
exports.getExpenses= asyncHandler(async(req,res)=>{
  let {orgId} =req.params
  let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 2;
     const offset = (page - 1) * limit;
     const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM expenses WHERE org_Id=${orgId}`
    );

    const total = countResult[0].total;
    // console.log(total,'total')
    
    const totalPages = Math.ceil(total / limit);
    const [expenses]=   await db.query(
      `SELECT * FROM expenses WHERE org_id=${orgId} ORDER BY expense_date DESC LIMIT ? OFFSET ?`,
      [limit, offset]
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
    
    return res.status(201).json({
        data:updatedRows,
        total,
        totalPages,
        message:"Expenses found",
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
    let {expense_date,main_head,debit,credit,net_balance,updated_by}=req.body
let sqlDate = expense_date;
    if (expense_date.includes("-") && expense_date.split("-")[0].length === 2) {
    const [day, month, year] = expense_date.split("-");
    sqlDate = `${year}-${month}-${day}`;  
}

    await db.query(
        `UPDATE expenses SET
        expense_date=?,main_head=?,debit=?,credit=?,net_balance=?,updated_by=?,
         updated_date = NOW()
         WHERE id = ?`,
        [
            sqlDate||expense.expense_date,
            main_head||expense.main_head,
            debit||expense.debit,
            credit||expense.credit,
            net_balance||expense.net_balance,
            updated_by||expense.updated_by,
            expense_id


        ]
    )

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
    const { month, year } = req.query;
    let {orgId} = req.params

  let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 2;
     const offset = (page - 1) * limit;
     const selectedYear = year || new Date().getFullYear();
    
     const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM expenses 
       WHERE org_id=? AND MONTH(expense_date) = ? 
      AND YEAR(expense_date) = ? `,[orgId,Number(month),Number(selectedYear)]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    

  

  const [rows] = await db.query(
    `SELECT *
     FROM expenses
     WHERE org_id=? AND MONTH(expense_date) = ?
     AND YEAR(expense_date) = ?
     LIMIT ? OFFSET ?`,
    [orgId,Number(month), Number(selectedYear),limit,offset]
  );
   const updatedRows = rows.map((item) => ({
      ...item,
      expense_date: addOneDay(item.expense_date),
    }));

  res.status(200).json({
    success: true,
    data: updatedRows,
    filterTotal:totalPages||1,
    page
  });

})