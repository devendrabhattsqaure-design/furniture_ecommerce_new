const express =require("express")
const { createExpense, getExpenses, editExpense, deleteExpense, filterExpense } = require("../controllers/expense.controller")
const { uploadBill } = require("../config/cloudinary")
const router = express.Router()

router.post('/create-expense/:orgId',uploadBill.single('bill_image'), createExpense)
router.get("/:orgId",getExpenses)
router.put('/edit/:id',uploadBill.single('bill_image'),editExpense)
router.delete('/delete/:id',deleteExpense)
router.get('/filter-expense/:orgId',filterExpense)

module.exports=router