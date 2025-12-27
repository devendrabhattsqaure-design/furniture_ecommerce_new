import { DollarSign, Edit2, Trash2, User2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FaRev, FaRupeeSign } from 'react-icons/fa'
import { useLocation, useParams } from 'react-router-dom'

const VendorViewPage = () => {
  let API = import.meta.env.VITE_API_BASE_URL;
  const [vendor, setVendor] = useState({})
  const [vendorItems, setVendorItems] = useState([])
  const [isExpense, setIsExpense] = useState(null)
  const [expense, setExpense] = useState([])
  const [active, setActive] = useState("items");
  const [total, setTotal] = useState(0);
  const [due, setDue] = useState(0);
  const [search, setSearch] = useState('')
  const { id } = useParams()

  const getVendor = async () => {
    let res = await fetch(`${API}/vendor/single/${id}`, {
      method: "GET",
    })
    let data = await res.json()
    // console.log(data)
    if (data.success) {
      setVendor(data.vendor)
      getvendorItems()
    }
  }

  const getvendorItems = async (search="") => {
    let res = await fetch(`${API}/vendor/vendor-items/${id}?search=${search}`, {
      method: "GET",
    })
    let data = await res.json()
    console.log(data)
    if (data.success) {
      setVendorItems(data.vendors)
      setDue(data.total)
    }
  }
  const getvendorExpenses = async () => {
    let res = await fetch(`${API}/expenses/get-vendor/${id}`, {
      method: "GET",
    })
    let data = await res.json()
    console.log(data)
    if (data.success) {
      setExpense(data.data)
      setTotal(data.total)
    }
  }
  const handleToggle = (value) => {
    setActive(value);
    onChange?.(value); // send value to parent if needed
  };
  useEffect(() => {
    getVendor()
    getvendorExpenses()

  }, [])
  const handleChange = (e) => {

    getvendorItems(e.target.value)
  }

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
              {vendorItems.length}

            </h4>
          </div>
        </div>
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-10 w-10 place-items-center">
            <FaRupeeSign className="w-6 h-6 text-white" />
          </div>
          <div className="p-4 text-right">
            <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
              Total Payment
            </p>
            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
              {/* {vendors.length} */}
              {total}
            </h4>
          </div>
        </div>
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-10 w-10 place-items-center">
            <FaRupeeSign className="w-6 h-6 text-white" />
          </div>
          <div className="p-4 text-right">
            <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
              Total Due Amount
            </p>
            <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
              {/* {vendors.length} */}
              {due}
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
          <h2 className="text-xl font-semibold">{vendor.vendor_name}'s  Items</h2>

        </div>

        <div className="overflow-x-auto">

          {
            active === 'expense' ?
              <div>
                <div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-1">

                  <button
                    onClick={() => handleToggle("expense")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all
          ${active === "expense"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Expense
                  </button>

                  <button
                    onClick={() => handleToggle("items")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all
          ${active === "items"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Items
                  </button>
                </div>
                <table
                  className="min-w-full divide-y divide-gray-200"
                >

                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">S.No.</th>
                      <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Expense Date</th>
                      <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Paid By</th>
                      <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Payment<br /> Method</th>
                      <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Transaction<br /> Type</th>

                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {expense?.map((item, i) => (
                      <tr className="hover:bg-gray-50 transition-colors" key={item.id}>
                        <td className='text-left'>{i + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(item.expense_date).toLocaleDateString()}</td>
                        <td className='text-left'>{item.paid_by}</td>
                        <td className='text-left'>₹ {item.amount}</td>
                        <td className='text-left'>{item.payment_method}</td>
                        <td className='text-left'>{item.transaction_type}</td>



                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              :
              <div>  <div className="flex justify-between rounded-lg border border-gray-300 bg-gray-100 p-1">
                <div>
                  <button
                    onClick={() => handleToggle("expense")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all
          ${active === "expense"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Expense
                  </button>

                  <button
                    onClick={() => handleToggle("items")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all
          ${active === "items"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Items
                  </button>

                </div>
                <div class="flex items-center gap-2">
                  <input

                    onChange={handleChange}
                    type="text"
                    placeholder="Search SKU"
                    class="p-2 w-48 border border-blue-400 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />


                </div>

              </div>
                <table className="min-w-full divide-y divide-gray-200">

                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                        S.No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                        Product Name
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                        Product Sku
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


                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendorItems?.map((vendor, i) => (
                      <tr key={vendor?.vendor_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {i + 1}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {vendor?.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {vendor?.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {vendor?.product_quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor?.product_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {vendor?.product_total}
                        </td>



                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }


        </div>

      </div>

    </div>
  )
}

export default VendorViewPage
