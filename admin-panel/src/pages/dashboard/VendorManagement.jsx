import { CubeIcon } from '@heroicons/react/24/solid'
import { Edit2, Eye, PlusIcon, Trash2, User2 } from 'lucide-react'
import { Warning } from 'postcss'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const VendorManagement = () => {
    let API = 'http://localhost:5000/api'
     const navigate = useNavigate();
    const [vendors,setVendors] = useState([])
    const [orgId,setOrgId] = useState(JSON.parse(localStorage.getItem('user')).org_id)
    const [showModal,setShowModal] = useState(false)
    const [editVendor,setEditVendor] = useState(null)
   
    const [formData,setFormData] = useState({
        vendor_name:"",
        vendor_address:"",
        vendor_number:"",
        vendor_gstno:"",
      
        org_id:""
    })

    const handleInputChange = async(e)=>{
        setFormData((prev)=>({...prev,[e.target.name]:e.target.value}))
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        
        let url = editVendor? `${API}/vendor/update/${editVendor}`:`${API}/vendor/create`
        let method = editVendor?'PUT':'POST'
        let res = await fetch(url,{
            method,
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(formData)
        })
        let data = await res.json()
        console.log(data)
        if(data.success){
            setShowModal(false)
            getAllVendors()
            editVendor?alert("Vendor updated successfully"):alert("Vendor created successfully")
            setEditVendor(null)
        }

       
    }

    const handleEdit = async(vendor)=>{
        setShowModal(true)
        setEditVendor(vendor.vendor_id)
        setFormData({
        vendor_name:vendor.vendor_name,
        vendor_address:vendor.vendor_address,
        vendor_number:vendor.vendor_number,
        vendor_gstno:vendor.vendor_gstno,
        
        })
    }
    const handleAdd = async(e)=>{
        setShowModal(true)
        setEditVendor(false)
        setFormData({
        vendor_name:"",
        vendor_address:"",
        vendor_number:"",
        vendor_gstno:"",
      
        org_id:orgId
        
    })
    }

    const handleDelete = async(id)=>{
        if (!window.confirm('Are you sure you want to delete this vendor?')) {
    return;
  }
        
        let res = await fetch(`${API}/vendor/delete/${id}`,{
            method:'DELETE'
        })
        let data = await res.json()
        if (data.success){
            getAllVendors()
            alert("Vendor Deleted successfully")
        }
       
    }

    const getAllVendors = async()=>{
        try {
            let res = await fetch(`${API}/vendor/${orgId}`)
            let data = await res.json()
            console.log(data)
            setVendors(data.vendors)
            
        } catch (error) {
            console.log(error.message)
        }
    }

    useEffect(()=>{
        getAllVendors()
    },[])

  return (
    <div className='mt-12'>
      <div className="mb-8 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <User2 className="w-6 h-6 text-white" />
          </div>
          <div className="p-4 text-right">
            <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
              Total Vendors
            </p>
            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
              {vendors?.length}
            </h4>
          </div>
        </div>
      </div>
      <div className="mb-4 rounded-lg bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Vendor Management</h2>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Vendor
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  GST no.
                </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Action
                </th>
                
                
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors?.map((vendor,i) => (
                <tr key={vendor.vendor_id} onClick={() => navigate(`/dashboard/vendor/${vendor.vendor_id}`, { state: vendor }) }>
                   <td className="px-6 py-4 whitespace-nowrap">     
                          {i+1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">     
                          {vendor.vendor_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {vendor.vendor_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.vendor_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {vendor.vendor_gstno}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                   <button
                          onClick={() => navigate(`/dashboard/vendor/${vendor.vendor_id}`)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Order"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                </td>
              
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editVendor ? 'Edit vendor' : 'Create vendor'}
              </h2>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* vendor Name */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                   Vendor Name *
                  </label>
                  <input
                    type="text"
                    name="vendor_name"
                    value={formData.vendor_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                   Vendor Number *
                  </label>
                  <input
                    inputMode="numeric"             // Mobile numeric keyboard
                    
                    maxLength={10}
                    minLength={10}
                    name="vendor_number"
                    value={formData.vendor_number}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                   Address
                  </label>
                  <input
                    type="text"
                    name="vendor_address"
                    value={formData.vendor_address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                   Vendor GST NO.
                  </label>
                  <input
                    type="text"
                    name="vendor_gstno"
                    value={formData.vendor_gstno}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                 {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                   Added By
                  </label>
                  <input
                    type="text"
                    name="added_by"
                    value={formData.added_by}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}


                {/* Form Actions */}
                <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    // disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    { (editVendor ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default VendorManagement
