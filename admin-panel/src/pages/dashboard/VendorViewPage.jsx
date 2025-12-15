import { DollarSign, Edit2, Trash2, User2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FaRev } from 'react-icons/fa'
import { useLocation, useParams } from 'react-router-dom'

const VendorViewPage = () => {
    let API = 'http://localhost:5000/api'
    const [vendor,setVendor] = useState({})
    const [vendorItems,setVendorItems] = useState([])
    const {id} = useParams()

    const getVendor = async()=>{
          let res = await fetch(`${API}/vendor/single/${id}`,{
            method:"GET", 
        })
        let data = await res.json()
        // console.log(data)
        if(data.success){
            setVendor(data.vendor)
            getvendorItems()
        }
    }

const getvendorItems = async()=>{
      let res = await fetch(`${API}/vendor/vendor-items/${id}`,{
            method:"GET", 
        })
        let data = await res.json()
        console.log(data)
        if(data.success){
            setVendorItems(data.vendors)
        }
}
    useEffect(()=>{
            getVendor()
            
    },[])
  return (
    <div className='mt-10'>
      <div className="max-w-md  bg-white shadow-lg rounded-xl p-4 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Name: {vendor.vendor_name}
      </h2>

      <div className="text-gray-700 mb-1">
        <strong>Number: </strong> {vendor.vendor_number}
      </div>

      <div className="text-gray-700 mb-1">
        <strong>Address: </strong> {vendor.vendor_address}
      </div>
    </div>
    <div className="mt-8 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-10 w-10 place-items-center">
            <User2 className="w-6 h-6 text-white" />
          </div>
          <div className="p-4 text-right">
            <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
              Total Products
            </p>
            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
              {/* {vendors.length} */}
              10
            </h4>
          </div>
        </div>
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-10 w-10 place-items-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="p-4 text-right">
            <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
              Total Payment
            </p>
            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
              {/* {vendors.length} */}
              10000
            </h4>
          </div>
        </div>
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-10 w-10 place-items-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="p-4 text-right">
            <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
              Total Due Amount
            </p>
            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
              {/* {vendors.length} */}
              5000
            </h4>
          </div>
        </div>
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-10 w-10 place-items-center">
            <FaRev className="w-6 h-6 text-white" />
          </div>
          <div className="p-4 text-right">
            <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
              Return Product
            </p>
            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
              5
            </h4>
          </div>
        </div>
      </div>
          <div className="mb-4 rounded-lg bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{vendor.vendor_name }'s  Items</h2>
          
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Product Name
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  total
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendorItems?.map((vendor) => (
                <tr key={vendor.vendor_id}>
                  <td className="px-6 py-4 whitespace-nowrap">     
                          {vendor.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {vendor.product_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.product_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {vendor.product_total}
                  </td>
                
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleEdit(vendor)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg hover:bg-blue-50"
                                            title="Edit"
                                          >
                                            <Edit2 size={18} />
                                          </button>
                                          <button
                                            onClick={() => handleDelete(vendor.vendor_id)}
                                            className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50"
                                            title="Delete"
                                          >
                                            <Trash2 size={18} />
                                          </button>
                                        </div>
                                      </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}

export default VendorViewPage
