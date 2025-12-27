import { DollarSign, Edit2, Eye, Filter, PlusIcon, Search, Trash2, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { FaEdit, FaRubleSign, FaRupeeSign, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import ExpenseViewPage from './ExpenseViewPage';
import { useNavigate } from 'react-router-dom';

const ExpenseManagement = () => {
  const navigate = useNavigate()
   const [page, setPage] = useState(1);
   const [filterPage, setFilterPage] = useState(null);
   const [filterTotalPage, setFilterTotalPage] = useState(null);
   const [totalPage, setTotalPage] = useState(1);
     const [expense, setExpense] = useState([]);
     const [viewExpense, setViewExpense] = useState(null);
      const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
  const [editItem, setEditItem] = useState(null);
    const [addItem, setAddItem] = useState(null);
    const [expenseTotal, setExpenseTotal] = useState(0);
    const [monthTotal, setMonthTotal] = useState(0);
    const [filter, setFilter] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [vendorSelect, setVendorSelect] = useState([]);
    const [vendorItems, setVendorItems] = useState([]);

  // Delete Confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [orgId, setOrgId] = useState(JSON.parse(localStorage.getItem('user')).org_id);
  const [form, setForm] = useState({
     expense_date: "",
      vendor_id :"",
      amount: "",
      paid_by:"",
      category:"",
      vendor_item:"",
      service:"",
      payment_method:"",
      transaction_type:"",
      description:"",
      bill_image:'',
      remark:""

    });

  const fetchVendors = async()=>{
    let res = await fetch(`http://localhost:5000/api/vendor/${orgId}`)
    let data = await res.json()
    console.log(data.vendors)
    setVendorSelect(data.vendors)

  }

  const handleChange = (e) => {
    // console.log(e.target.value)
    setForm({ ...form, [e.target.name]: e.target.value });
    
  };
  
   const handleSave = async() => {
    

    const submitData = new FormData();
     submitData.append('expense_date', form.expense_date);
     submitData.append('category', form.category);
     submitData.append('service', form.service);
     submitData.append('vendor_id', form.vendor_id);
     submitData.append('vendor_item', form.vendor_item);

     submitData.append('paid_by', form.paid_by);
     submitData.append('amount', form.amount);
     submitData.append('payment_method', form.payment_method);
     submitData.append('transaction_type', form.transaction_type);
     submitData.append('description', form.description);
     submitData.append('remark', form.remark);
      if (form.bill_image) {
        submitData.append('bill_image', form.bill_image);
      }
      console.log(submitData  )
     try {
      const res = await fetch(`http://localhost:5000/api/expenses/create-expense/${orgId}`, {
        method: "POST",
       
        body: submitData,
      });

      const data = await res.json();
      console.log(data)
      if (data.success) {
        toast.success("Expense added successfully")
        fetchExpenses(); // refresh list
        setAddItem(false);
        setVendorSelect(null)
        setForm({  expense_date: "",
      vendor_id :"",
      amount: "",
      org_id:"",
     vendor_item:"",
      paid_by:"",
      category:"",
      service:"",
      payment_method:"",
      transaction_type:"",
      description:"",
      bill_image:'',
      remark:''

      });
      }
    } catch (err) {
      console.error("Error updating  Expense", err);
    }
  };
   const handleEditData = async(id) => {
    // console.log(form)
    const submitData = new FormData();
     submitData.append('expense_date', form.expense_date);
     submitData.append('category', form.category);
     submitData.append('service', form.service);
     submitData.append('vendor_id', form.vendor_id);
     submitData.append('vendor_item', form.vendor_item);
     submitData.append('paid_by', form.paid_by);
     submitData.append('amount', form.amount);
     submitData.append('payment_method', form.payment_method);
     submitData.append('transaction_type', form.transaction_type);
     submitData.append('description', form.description);
     submitData.append('remark', form.remark);
      if (form.bill_image) {
        submitData.append('bill_image', form.bill_image);
      }
     try {
      const res = await fetch(`http://localhost:5000/api/expenses/edit/${id}`, {
        method: "PUT",
        
        body: submitData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Expense updated successfully")
        fetchExpenses(); // refresh list
        setEditItem(false);
        setVendorSelect(null)
        setForm({  expense_date: "",
      vendor_id :"",
      amount: "",
      org_id:"",
     vendor_item:"",
      paid_by:"",
      category:"",
      service:"",
      payment_method:"",
      transaction_type:"",
      description:"",
      bill_image:'',
      remark:''
      });
      }
    } catch (err) {
      console.error("Error updating  Expense", err);
    }
  };

  const handleDelete = async(id)=>{
     const res = await fetch(`http://localhost:5000/api/expenses/delete/${id}`, {
        method: "DELETE",
       
      });
      const data = await res.json();
      if(data.success){
        toast.success("Expense deleted successfully")
        setDeleteId(false)
        fetchExpenses()
        
      }
  }


    const fetchExpenses = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${orgId}?page=${page}`);
      const data = await res.json();
      console.log(data)

     let expense = data.data
      // console.log(data.data,'data')
      let searchedUser = expense.filter((item) => {
  if (!searchTerm) return true;   // if input empty → return all
  return item.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
});
setExpenseTotal(data.todayTotal)
setMonthTotal(data.monthTotal)
setExpense(searchedUser)
      setTotalPage(data.totalPages)
    } catch (err) {
      console.error("Error fetching expenses", err);
    }
  };

  const handleEdit = (item)=>{
    setEditItem(item)
    setForm(item)
  }

  const handleAddItem = ()=>{
    setAddItem(true)
    // setVendorSelect(null)
    setForm({
      expense_date: "",
      vendor_id :"",
      amount: "",
      org_id:"",
     vendor_item:"",
      paid_by:"",
      category:"",
      service:"",
      payment_method:"",
      transaction_type:"Debit",
      bill_image:'',
      description:"",
      remark:"",
    })
  }




const handleFilter = async (e) => {

 let params = new URLSearchParams({
      page,
    });

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    if (searchTerm) params.append("search", searchTerm);

    const res = await fetch(
      `http://localhost:5000/api/expenses/filter-expense/${orgId}?${params.toString()}`
    );
  
  //

    const data = await res.json();

    if (data.success) {
      setExpense(data.data);
      setFilterPage(data.page);
      setFilterTotalPage(data.filterTotal);
      setMonthTotal(data.totalAmount)
    }
 
};
;
const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, WebP, GIF)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create preview
     
      // Store file for upload
      setForm(prev => ({
        ...prev,
        bill_image: file
      }));
    }
  };

const getVendorsItems = async(e)=>{
  setForm({ ...form, [e.target.name]: e.target.value });
  // console.log(form.vendor_id)
  if(e.target.value){
let res = await fetch(`http://localhost:5000/api/vendor/due/${e.target.value}`)
  let data = await res.json()
  console.log(data)
  setVendorItems(data.vendors)
  }
  

}

  useEffect(()=>{
    let id = JSON.parse(localStorage.getItem('user')).org_id
      setOrgId(id)
    fetchExpenses()
   
    
  },[page,searchTerm])
  useEffect(()=>{
    const loadVendors = async () => {
    try {
      let res = await fetch(`http://localhost:5000/api/vendor/${orgId}`);
      let data = await res.json();
      console.log("Vendors fetched:", data.vendors);
      setVendorSelect(data.vendors || []);
       // Ensure it's always an array
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendorSelect([]); // Set empty array on error
    }
  };
  loadVendors()
  },[])
  return (
    <>
    <ToastContainer/>
    <div className="min-h-screen bg-gray-50 py-6">
     
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Income */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaRupeeSign className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Today</span>
              </div>
              
              <p className="text-gray-600">Today Expense</p>
              <div className="mt-4  text-md">
                <div>
                  
                  <p className="font-semibold text-xl">₹ {expenseTotal}</p>
                </div>
                
              </div>
            </div>

            {/* Monthly Income */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Monthly</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {/* {formatCurrency(reportData.summary.monthly.total_sales)} */}
              </h3>
              <p className="text-gray-600">Monthly Expense</p>
              <div className="mt-4  text-sm">
                <div>
                 <p className="font-semibold text-xl">₹ {monthTotal}</p>
                </div>
                
              </div>
            </div>
            </div>
       
          <div className="bg-white p-4  shadow-md overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Expense Management</h2>
        
          <button
            onClick={()=>handleAddItem()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Expense
          </button>
        </div>
        
        
        <div className="mt-4 flex flex-wrap gap-2">
            <input
  type="text"
  className="border px-3 py-1 rounded"
  value={searchTerm}
  placeholder='Search By Vendor Name'
  onChange={(e) => setSearchTerm(e.target.value)}
/>
                  <input
  type="date"
  className="border px-3 py-1 rounded"
  value={fromDate}
  onChange={(e) => setFromDate(e.target.value)}
/>

<input
  type="date"
  className="border px-3 py-1 rounded"
  value={toDate}
  onChange={(e) => setToDate(e.target.value)}
/>

<button
  onClick={() => {
    setPage(1);
    handleFilter();
  }}
  className="bg-blue-600 text-white px-4 py-1 rounded"
>
  Apply
</button>

<button
  onClick={() => {
    setFromDate("");
    setToDate("");
    setPage(1);
    fetchExpenses();
  }}
  className="bg-gray-500 text-white px-4 py-1 rounded"
>
  Reset
</button>

                    {/* <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                     
                    </div>
                   <div className="mt-4 flex flex-wrap items-center gap-2 ">
                  <input
                      type="date"
                       className="border px-3 py-1 rounded"
                       value={filter}
                       onChange={handleFilter}
                  />
                  <input
                      type="text"
                       className="border px-3 py-1 rounded text-md"
                       placeholder='Search By Vendor Name'
                       value={searchTerm}
                       onChange={(e)=>setSearchTerm(e.target.value)}
                  />

                  
                     </div> */}
                   
            
                  </div>
</div>
<div className="overflow-x-auto">
      <table
        className="min-w-full divide-y divide-gray-200"
      >
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">S.No.</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Expense Date</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Paid By</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product/<br/>Service</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Payment<br/> Method</th>
            <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Transaction<br/> Type</th>
            
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {expense?.map((item,i) => (
            <tr className="hover:bg-gray-50 transition-colors" key={item.id}>
              <td className='text-center'>{i+1}</td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(item.expense_date).toLocaleDateString()}</td>
              <td className='text-center'>{item.paid_by}</td>
              <td className='text-center'>₹ {item.amount}</td>
              <td className='text-center'> {item.category}<br/>{item.vendor_name&&<span className='text-sm'>{`(${item.vendor_name})`}</span>}</td>
              <td className='text-center'>  {item.service}</td>
              <td className='text-center'>{item.payment_method}</td>
              <td className='text-center'>{item.transaction_type}</td>
             
              <td className='items-center'>
            <div className="flex items-center justify-center gap-2">
                       <button
  onClick={() =>
  navigate(`/dashboard/expense/${item.id}`)
}
  className="text-blue-600 hover:text-blue-800"
>
  <Eye/>
</button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Order"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          title="Delete Order"
                        >
                          <Trash2 className="text-red-600 hover:text-red-800 transition-colors" />
                        </button>
                      </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

        {/* Pagination */}
      <div  className="mt-4 flex justify-center items-center gap-4" >
        <button
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={(filterPage ? filterPage === 1 : page === 1)}
          onClick={() => filterPage?setFilterPage(filterPage-1):setPage(page - 1)}
          
        >
          Prev
        </button>

        <span>
          Page {filterPage?filterPage:page} of {filterTotalPage?filterTotalPage:totalPage}
        </span>

        <button
       className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
         disabled={(filterPage ? filterPage === filterTotalPage : page === totalPage)}

          onClick={() => filterPage?setFilterPage(filterPage+1):setPage(page + 1)}
          
        >
          Next
        </button>
      </div>

{addItem && (
<div className="fixed inset-0 bg-black bg-opacity-40 w-full flex justify-center items-center z-50">
  <div className="bg-white w-full max-w-5xl p-6 rounded-xl shadow-lg">
    <h3 className="text-xl font-semibold mb-4">Create Expense</h3>

    <form className="space-y-4">
      {/* GRID LAYOUT - 4 COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Expense Date */}
        <div>
          <label className="block text-sm font-medium">Expense Date</label>
          <input
            type="date"
            name="expense_date"
            value={form.expense_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select</option>
            <option value="Vendor Payment">Vendor Payment</option>
            <option value="Staff Salary">Staff Salary</option>
            <option value="Rent">Rent</option>
            <option value="Food">Food</option>
            <option value="Inventory">Inventory</option>
            <option value="Electricity Bill">Electricity Bill</option>
            <option value="Maintainance">Maintainance</option>
          </select>
        </div>

        {/* Product / Service */}
        <div>
          <label className="block text-sm font-medium">Product / Service</label>
          <input
            type="text"
            name="service"
            value={form.service}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Vendor Name */}
         
         {form.category==="Vendor Payment"&&
         <div className='z-99 w-full'>
          <label className="block text-sm font-medium">Vendor Name</label>
          <select
            name="vendor_id"
            value={form.vendor_id||''}
            onChange={getVendorsItems}
            className="w-full px-3 py-2 z-999 border rounded-lg"
          >
              <option value="">Select Vendor</option>
      {vendorSelect && vendorSelect.length > 0 && (
        
        vendorSelect.map((vendor) => (
          <option key={vendor.vendor_id || vendor.id} value={vendor.vendor_id || vendor.id}>
            
            {vendor.vendor_name}
          </option>
        ))
      ) }
   
          </select>
        </div>
        }
        
       { form.category==='Vendor Payment'&&
         <div className='z-99 '>
          <label className="block text-sm font-medium">Vendor Items</label>
          <select
            name="vendor_item"
            value={form.vendor_item||''}
            onChange={handleChange}
            className="w-full px-3 py-2 z-999 border rounded-lg"
          >
              <option value="">Select Item</option>
        {vendorItems.map((item)=>{
          
           return <option value={item.vendor_items_id}>{item.product_name}</option>
          
        })}
        </select>
        </div>
         }

        {/* Credit */}
        

        {/* Debit */}
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Paid By */}
        <div>
          <label className="block text-sm font-medium">Paid By</label>
          <input
            type="text"
            name="paid_by"
            value={form.paid_by}
            onChange={(e) => setForm(prev => ({ ...prev, paid_by: e.target.value.charAt(0).toUpperCase()+e.target.value.slice(1) }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium">Payment Method</label>
          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank">Bank</option>
            <option value="Card">Card</option>
          </select>
        </div>

        {/* Transaction Type */}
        <div >
          <label className="block text-sm font-medium">Transaction Type</label>
          <select
            name="transaction_type"
            value={form.transaction_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          > 
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        {/* Bill Image */}
        <div>
          <label className="block text-sm font-medium">Bill Image</label>
          <input
            type="file"
            accept="image/*"
            name="bill_image"
            onChange={handleImageSelect}
            className="w-full border rounded-lg p-2"
          />
        </div>

      </div>

      {/* Description - Full Width */}
      <div>
        <label className="block text-sm font-medium">Remark</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Create
        </button>

        <button
          type="button"
          onClick={() => setAddItem(null)}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>


)}

      {editItem && (
  <div className="fixed inset-0 bg-black bg-opacity-40 w-full flex justify-center items-center z-50">
  <div className="bg-white w-full max-w-5xl p-6 rounded-xl shadow-lg">
    <h3 className="text-xl font-semibold mb-4">Edit Expense</h3>

    <form className="space-y-4">
      {/* GRID LAYOUT - 4 COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Expense Date */}
        <div>
          <label className="block text-sm font-medium">Expense Date</label>
          <input
            type="date"
            name="expense_date"
            value={form.expense_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select</option>
            <option value="Vendor Payment">Vendor Payment</option>
            <option value="Staff Salary">Staff Salary</option>
            <option value="Rent">Rent</option>
            <option value="Food">Food</option>
            <option value="Inventory">Inventory</option>
            <option value="Electricity Bill">Electricity Bill</option>
            <option value="Maintainance">Maintainance</option>
          </select>
        </div>

        {/* Product / Service */}
        <div>
          <label className="block text-sm font-medium">Product / Service</label>
          <input
            type="text"
            name="service"
            value={form.service}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

{/* vendor name */}
        
         {form.category==="Vendor Payment"&&
         <div className='z-99 w-full'>
          <label className="block text-sm font-medium">Vendor Name</label>
          <select
            name="vendor_id"
            value={form.vendor_id||''}
            onChange={getVendorsItems}
            className="w-full px-3 py-2 z-999 border rounded-lg"
          >
              <option value="">Select Vendor</option>
      {vendorSelect && vendorSelect.length > 0 && (
        
        vendorSelect.map((vendor) => (
          <option key={vendor.vendor_id || vendor.id} value={vendor.vendor_id || vendor.id}>
            
            {vendor.vendor_name}
          </option>
        ))
      ) }
   
          </select>
        </div>
        }

        { form.category==='Vendor Payment'&&
         <div className='z-99 '>
          <label className="block text-sm font-medium">Vendor Items</label>
          <select
            name="vendor_item"
            value={form.vendor_item||''}
            onChange={handleChange}
            className="w-full px-3 py-2 z-999 border rounded-lg"
          >
              <option value="">Select Item</option>
        {vendorItems.map((item)=>{
          
           return <option value={item.vendor_items_id}>{item.product_name}</option>
          
        })}
        </select>
        </div>
         }
        

        {/* Debit */}
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Paid By */}
        <div>
          <label className="block text-sm font-medium">Paid By</label>
          <input
            type="text"
            name="paid_by"
            value={form.paid_by}
            onChange={(e) => setForm(prev => ({ ...prev, paid_by: e.target.value.charAt(0).toUpperCase()+e.target.value.slice(1) }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium">Payment Method</label>
          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank">Bank</option>
            <option value="Card">Card</option>
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium">Transaction Type</label>
          <select
            name="transaction_type"
            value={form.transaction_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          > 
            <option value="Debit">Debit</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        {/* Bill Image */}
        <div>
          <label className="block text-sm font-medium">Bill Image</label>
          <input
            type="file"
            accept="image/*"
            name="bill_image"
            onChange={handleImageSelect}
            className="w-full border rounded-lg p-2"
          />
        </div>

      </div>

      {/* Description - Full Width */}
      <div>
        <label className="block text-sm font-medium">Remark</label>
        <textarea
          name="Remark"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={()=>handleEditData(editItem.id)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => setEditItem(null)}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>
)}

{deleteId && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white w-80 p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-6 text-center">
        Are you sure you want to delete?
      </h3>

      <div className="flex justify-center gap-4">
        <button
          onClick={()=>handleDelete(deleteId)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Yes, Delete
        </button>

        <button
          onClick={() => setDeleteId(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


      
    </div>
    </>
  )
}

export default ExpenseManagement
