const express =require("express")
const { createExpense, getExpenses, editExpense, deleteExpense, filterExpense } = require("../controllers/expense.controller")
const router = express.Router()

router.post('/create-expense/:orgId',createExpense)
router.get("/:orgId",getExpenses)
router.put('/edit/:id',editExpense)
router.delete('/delete/:id',deleteExpense)
router.get('/filter-expense/:orgId',filterExpense)

module.exports=router