const express =require("express")
const { createExpense, getExpenses, editExpense, deleteExpense, filterExpense, getVendorExpenses, getOneExpense } = require("../controllers/expense.controller")
const { uploadBill } = require("../config/cloudinary")
const router = express.Router()

router.post('/create-expense/:orgId',uploadBill.single('bill_image'), createExpense)
router.get("/:orgId",getExpenses)
router.put('/edit/:id',uploadBill.single('bill_image'),editExpense)
router.delete('/delete/:id',deleteExpense)
router.get('/filter-expense/:orgId',filterExpense)
router.get('/get-vendor/:id',getVendorExpenses)
router.get('/view-expense/:id',getOneExpense)

module.exports=router