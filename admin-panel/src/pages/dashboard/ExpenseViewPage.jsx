import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";


const ExpenseViewPage = () => {
   
    const params = useParams()
    console.log(params)
    const [expense,setExpense] = useState({})
    const getExpense = async()=>{
      try {
        const res = await fetch(`http://localhost:5000/api/expenses/view-expense/${params.id}`);
      const data = await res.json();
      setExpense(data.expense)

     
      } catch (error) {
        console.log(error)
      }
    }
useEffect(()=>{
  getExpense()
},[])
  return (
    
    <div className=" flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 relative">

        <h2 className="text-2xl font-semibold mb-6">Expense Details</h2>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <Detail label="Expense Date" value={formatDate(expense?.expense_date)} />
          <Detail label="Category" value={expense?.category} />
          <Detail label="Transaction Type" value={expense?.transaction_type} />

          <Detail label="Paid By" value={expense?.paid_by} />
          <Detail label="Payment Method" value={expense?.payment_method} />
          <Detail label="Amount" value={`₹ ${expense?.amount}`} />

          <Detail label="Service / Product" value={expense?.service} />
          <Detail label="Vendor Item" value={expense?.product_name} />
          <Detail label="Vendor ID" value={expense?.vendor_name} />
        </div>

        {/* DESCRIPTION */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-600">Description</label>
          <p className="mt-1 bg-gray-100 p-3 rounded">
            {expense?.description || "—"}
          </p>
        </div>

        {/* REMARK */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-600">Remark</label>
          <p className="mt-1 bg-gray-100 p-3 rounded">
            {expense?.remark || "—"}
          </p>
        </div>

        {/* BILL IMAGE */}
        {expense?.bill_image && (
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-600 block mb-2">
              Bill Image
            </label>
            <img
              src={expense.bill_image}
              alt="Bill"
              className="max-h-44 rounded border"
            />
          </div>
        )}

      
      </div>
    </div>
  );
};

/* ---------- Reusable Field ---------- */
const Detail = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-900">
      {value || "—"}
    </p>
  </div>
);

/* ---------- Date Format ---------- */
const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN");
};

export default ExpenseViewPage;
