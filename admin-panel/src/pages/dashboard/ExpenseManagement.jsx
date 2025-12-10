import { Edit2, Filter, PlusIcon, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { FaEdit, FaTrash } from "react-icons/fa";

const ExpenseManagement = () => {
   const [page, setPage] = useState(1);
   const [filterPage, setFilterPage] = useState(null);
   const [filterTotalPage, setFilterTotalPage] = useState(null);
   const [totalPage, setTotalPage] = useState(1);
     const [expense, setExpense] = useState([]);
       // Edit Modal State
  const [editItem, setEditItem] = useState(null);
    const [addItem, setAddItem] = useState(null);
    const [filter, setFilter] = useState({});

  // Delete Confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [orgId, setOrgId] = useState(JSON.parse(localStorage.getItem('user')).org_id);
  const [form, setForm] = useState({
      expense_date: "",
      main_head :"",
      debit: "",
      org_id:"",
      credit:"",
      added_by:"",
      added_date:"",
      updated_by:"",
      updated_date:""

    });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
   const handleSave = async() => {
    // console.log(form)
     try {
      const res = await fetch(`http://localhost:5000/api/expenses/create-expense/${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log(data)
      if (data.success) {
        alert("Expense addes successfully!");
        fetchExpenses(); // refresh list
        setAddItem(false);
        setForm({  expense_date: "",
      main_head :"",
      debit: "",
      org_id:"",
      credit:"",
      added_by:"",
      });
      }
    } catch (err) {
      console.error("Error updating  Expense", err);
    }
  };
   const handleEditData = async(id) => {
    // console.log(form)
     try {
      const res = await fetch(`http://localhost:5000/api/expenses/edit/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Expense updated successfully!");
        fetchExpenses(); // refresh list
        setEditItem(false);
        setForm({  expense_date: "",
      main_head :"",
      debit: "",
      org_id:"",
      credit:"",
      added_by:"",
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
        setDeleteId(false)
        fetchExpenses()
        
      }
  }


    const fetchExpenses = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${orgId}?page=${page}`);
      const data = await res.json();
      // console.log(data)
      setExpense(data.data);
      // console.log(data.data,'data')
      setTotalPage(data.totalPages)
    } catch (err) {
      console.error("Error fetching expenses", err);
    }
  };

  const handleEdit = (item)=>{
    setEditItem(item)
    setForm(item)
  }

  const fetchFilteredExpense = async () => {
    // console.log(filter.month)
  const month = filter?.month?.slice(5);
  const year = filter?.month?.slice(0, 4);

  const res = await fetch(
    `http://localhost:5000/api/expenses/filter-expense/${orgId}?month=${month}&year=${year}&page=${filterPage || 1}`
  );

  const data = await res.json();

  setExpense(data.data);
  setFilterTotalPage(data.filterTotal);
};


  const handleFilter = async (e) => {
  const value = e.target.value;  // YYYY-MM
     if (value === "") {
    setFilter({ month: "" });
    setFilterPage(null);
    setFilterTotalPage(null)
    fetchExpenses();
    return;
  }

  // update state
  setFilter({ ...filter, month: value });

  // extract month + year from value
  const month = value.slice(5);     // MM
  const year = value.slice(0,4); 
  console.log(year)  // YYYY

  try {
    const res = await fetch(
      `http://localhost:5000/api/expenses/filter-expense/${orgId}?month=${month}&year=${year}`
    );

    const data = await res.json();
    // console.log(data);

    if (data.data) {
      setExpense(data.data);
    setFilterPage(data.page);
    setFilterTotalPage(data.filterTotal);
    }

  } catch (err) {
    console.error("Error fetching expenses", err);
  }
};

useEffect(()=>{
  if (filter.month !== "") {
    fetchFilteredExpense();
  }
},[filterPage])

  useEffect(()=>{
    let id = JSON.parse(localStorage.getItem('user')).org_id
      setOrgId(id)
    fetchExpenses()
    
  },[page])
  return (
    <div className="min-h-screen bg-gray-50 py-6">
     
     
       
          <div className="bg-white p-4  shadow-md overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Expense Management</h2>
          <button
            onClick={()=>setAddItem(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Expense
          </button>
        </div>
        
        
        <div className="mt-4 flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                     
                    </div>
                   <div className="mt-4 flex flex-wrap items-center ">
                  <input
                      type="month"
                       className="border px-3 py-1 rounded"
                       value={filter.month}
                       onChange={handleFilter}
                  />
                  
                     </div>
                   
            
                  </div>
</div>
<div className="overflow-x-auto">
      <table
        className="min-w-full divide-y divide-gray-200"
      >
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Expense Date</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Main Head</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Credit</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Debit</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Net Balance</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Added By</th>
            
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {expense?.map((item) => (
            <tr className="hover:bg-gray-50 transition-colors" key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(item.expense_date).toLocaleDateString()}</td>
              <td className='text-center'>{item.main_head}</td>
              <td className='text-center'>₹ {item.credit}</td>
              <td className='text-center'>₹ {item.debit}</td>
              <td className='text-center'> ₹ {item.net_balance}</td>
              <td className='text-center'>{item.added_by}</td>
             
              <td className='items-center'>
            <div className="flex items-center gap-2">
                       
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
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white w-96 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Edit Expense</h3>
        <form >
         <label className="block text-sm font-medium">Expense Date</label>
      <input
        type="date"
        name='expense_date'
        onChange={handleChange}
        value={form.expense_date}
        
        className="w-full px-3 py-1 mb-2 border rounded-lg "
      />
      <label className="block text-sm font-medium">Main Head</label>
      <input
        type="text"
        name='main_head'
        onChange={handleChange}
        value={form.main_head}
        
        className="w-full px-3 py-1 border rounded-lg mb-2"
      />

      <label className="block text-sm font-medium">Credit</label>
      <input
        type="number"
        name='credit'
        value={form.credit}
        onChange={handleChange}
        className="w-full px-3 py-1 border rounded-lg mb-2"
      />

      <label className="block text-sm font-medium">Debit</label>
      <input
        type="number"
        name='debit'
        value={form.debit}
        onChange={handleChange}
        className="w-full px-3 py-1 border rounded-lg mb-2"
      />
        <label className="block text-sm font-medium">Added By</label>
      <input
        type="text"
        name='added_by'
        value={form.added_by}
        onChange={handleChange}
        className="w-full px-3 py-1 border rounded-lg mb-2"
      />
     

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Save
        </button>
        <button
          onClick={() => setEditItem(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
        </form>
    </div>
  </div>
)}

      {editItem && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white w-96 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Edit Expense</h3>
        <form >
         <label className="block text-sm font-medium">Expense Date</label>
      <input
        type="date"
        name='expense_date'
        onChange={handleChange}
        value={form.expense_date}
        
        className="w-full px-3 py-1 mb-2 border rounded-lg "
      />
      <label className="block text-sm font-medium">Main Head</label>
      <input
        type="text"
        name='main_head'
        onChange={handleChange}
        value={form.main_head}
        
        className="w-full px-3 py-1 border rounded-lg mb-2"
      />

      <label className="block text-sm font-medium">Credit</label>
      <input
        type="number"
        name='credit'
        value={form.credit}
        onChange={handleChange}
        className="w-full px-3 py-1 border rounded-lg mb-2"
      />

      <label className="block text-sm font-medium">Debit</label>
      <input
        type="number"
        name='debit'
        value={form.debit}
        onChange={handleChange}
        className="w-full px-3 py-1 border rounded-lg mb-2"
      />
        <label className="block text-sm font-medium">Added By</label>
      <input
        type="text"
        name='added_by'
        value={form.added_by}
        onChange={handleChange}
        className="w-full px-3 py-1 border rounded-lg mb-2"
      />
     

      <div className="flex justify-end gap-3">
        <button
          onClick={()=>handleEditData(editItem.id)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Save
        </button>
        <button
          onClick={() => setEditItem(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
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
  )
}

export default ExpenseManagement
