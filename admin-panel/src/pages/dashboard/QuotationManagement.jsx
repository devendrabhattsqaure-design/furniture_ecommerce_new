import { Download, Eye, Loader2, MapPin, Phone, Plus, Search, Share, Share2, User, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import html2pdf from "html2pdf.js";
import QuotationViewPage from '../dashboard/QuotationViewPage';

const QuotationManagement = () => {
    const [quotations,setQuotations] = useState([])
    const [showModal,setShowModal] = useState(null)
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuotationTerm, setSearchQuotationTerm] = useState('');
      const [selectedCategory, setSelectedCategory] = useState('');
      const [orgId, setOrgId] = useState(JSON.parse(localStorage.getItem('user')).org_id);
       const reportRef = useRef();


    const [formData,setFormData] = useState({
        customer_name: '',
    customer_phone: '',
    
    customer_address: '',
    items: [],
   gst_amount:"",
   gst_percentage:"",
   discount_amount:"",
   discount_percentage:"",
   shipping_charges:""

})
     const [categoryList, setCategoryList] = useState([]);
     const [products, setProducts] = useState([]);
     const [selectedQuotation, setSelectedQuotation] = useState(null);
const pdfRef = useRef();

    const fetchCategory = async()=>{
        const res = await fetch(`http://localhost:5000/api/categories`,
          {headers: {
          // 'Authorization': `Bearer ${token}`,
          'x-org-id': orgId,
        }}
        );
    const data = await res.json();
    setCategoryList(data.data);
    }




const handleSubmit = async(e)=>{
     e.preventDefault();
   
        
        if (!formData.customer_name) {
          toast.error("Customer name is required");
          return;
        }
    
        if (formData.items.length === 0) {
          toast.error("Please add at least one product to the bill");
          return;
        }
    
        
    
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/quotation/create/${orgId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
    
          const data = await response.json();
    
          if (response.ok) {
            toast.success("Quotation created successfully!");
            setShowModal(false);
            // fetchBills();
            fetchQuotations()
          } else {
            toast.error(data.message || "Failed to create Quotation");
          }
        } catch (error) {
          console.error('Error creating bill:', error);
          toast.error("Network error. Please try again.");
        } 
}

     const addProductToQuotation = (product) => {
        const existingItem = formData.items.find(item => item.product_id === product.product_id);
        
        if (existingItem) {
          const updatedItems = formData.items.map(item =>
            item.product_id === product.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          setFormData(prev => ({ ...prev, items: updatedItems }));
        } else {
          const newItem = {
            product_id: product.product_id,
            product_name: product.product_name,
            category_id:product.category_id,
            sku: product.sku,
            price: product.price,
            quantity: 1,
            total: product.price
          };
          setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
        }
        
        toast.success(`${product.product_name} added to bill`);
      };

  const searchQuotation = async (search = '') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      

      const response = await fetch(`http://localhost:5000/api/quotation/search-quotation/${orgId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(data)
        setQuotations(data.data || []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };
  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItemFromBill(productId);
      return;
    }

    const updatedItems = formData.items.map(item =>
      item.product_id === productId
        ? { 
            ...item, 
            quantity: newQuantity,
            total: item.price * newQuantity
          }
        : item
    );
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };
  const removeItemFromBill = (productId) => {
    const updatedItems = formData.items.filter(item => item.product_id !== productId);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };
    const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchProducts(value, selectedCategory);
  };
  const closeModal = () => setSelectedQuotation(null);

  const handleSearchQuotationChange = (e) => {
    const value = e.target.value;
    setSearchQuotationTerm(value);
    searchQuotation(value);
  };


 const searchProducts = async (search = '', categoryId = '') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryId) params.append('category_id', categoryId);

      const response = await fetch(`http://localhost:5000/api/bills/products/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    searchProducts(searchTerm, value);
  };
  const calculateTotals = () => {
  // Ensure items exist
  const items = Array.isArray(formData.items) ? formData.items : [];

  // Subtotal (sum of item totals)
  const subtotal = items.reduce((sum, item) => {
    const val = parseFloat(item.total) || 0;
    return sum + val;
  }, 0);

  // -------------------------------
  // 🔹 Discount Calculation
  // -------------------------------
  let discount = 0;

  if (formData.discount_amount && !isNaN(formData.discount_amount)) {
    discount = parseFloat(formData.discount_amount);
  } else if (formData.discount_percentage && !isNaN(formData.discount_percentage)) {
    discount = (subtotal * parseFloat(formData.discount_percentage)) / 100;
  }

  // -------------------------------
  // 🔹 Tax (GST) Calculation
  // -------------------------------
  let tax = 0;

  if (formData.gst_amount && !isNaN(formData.gst_amount)) {
    tax = parseFloat(formData.gst_amount);
  } else if (formData.gst_percentage && !isNaN(formData.gst_percentage)) {
    tax = (subtotal * parseFloat(formData.gst_percentage)) / 100;
  }

  // -------------------------------
  // 🔹 Final Total
  // -------------------------------
  const total = subtotal - discount + tax + Number(formData.shipping_charges)
// setFormData(prev => ({ ...prev, subtotal:subtotal,discount:discount,tax:tax,total:total }))
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

  const { subtotal, discount, tax, total } = calculateTotals();

const fetchQuotations = async()=>{
  const res = await fetch(`http://localhost:5000/api/quotation/${orgId}`)
  const data = await res.json();
  console.log(data)
  if(data.success){
    setQuotations(data.rows)
  }
  // setQuotations(data.rows)
}

 const sendOnWhatsApp = (number) => {
 
  const url = `https://wa.me/${number}`;
  window.open(url, "_blank");
};

const handleDownloadClick = async (quotationId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/quotation/download/${quotationId}`
    );
    const data = await res.json();

  const fixed = {
  ...data.row,
  items: typeof data.row.items === "string" 
    ? JSON.parse(data.row.items) 
    : data.row.items
};
  setSelectedQuotation(fixed);  // save full quotation
    setTimeout(() => generatePDF(data.row), 800);  // generate pdf after data loads
  } catch (err) {
    console.log(err);
  }
};


const generatePDF = (item) => {
  
  const opt = {
    margin: 5,
    filename: `${item.customer_name}_quoation.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(pdfRef.current).save();
  
};




    useEffect(()=>{
      let id = JSON.parse(localStorage.getItem('user')).org_id
      setOrgId(id)
        fetchCategory()
        searchProducts()
        fetchQuotations()
    },[])

  return (
     <div className="min-h-screen bg-gray-50 py-6">
         <ToastContainer />
        <div className="mb-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quotation Management</h1>
        <p className="text-gray-600">Create and manage Quatations</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 mx-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Quotation By Customer Name..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchQuotationTerm}
                      onChange={handleSearchQuotationChange}
                    />
                  </div>
                </div>
      
                <button
                  onClick={()=>setShowModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Create New Quotation
                </button>
              </div>
            </div>
        <div className="bg-white rounded-lg shadow-sm border mx-4 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-800">Recent Quotation</h2>
                </div>
        
               
                  {
                    quotations.length!=0?<div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Quotation No.</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Customer Name</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Customer Number</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
                      
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {quotations.map((item) => (
                          <tr key={item.quotation_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-blue-600">{item.quotation_id}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-blue-600">{item.customer_name}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{item.customer_mobile}</div>
                             
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{new Date(item.quotation_date).toLocaleDateString()}</div>
                             
                            </td>
                            
                           
                         
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={()=>setSelectedQuotation(item)}
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                {/* <button
                                   onClick={() => handleDownloadClick(item.quotation_id)}
                                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
                                >
                                  <Download className="w-4 h-4" />
                                </button> */}
                                 <button
                                  onClick={() => sendOnWhatsApp(item.customer_mobile)}
                                  className="text-green-600 hover:text-gray-800 text-sm flex items-center gap-1"
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>:<div className='text-center text-2xl mt-10b text-gray-600'>
                    No Quotations
                  </div>
                  }
                
              </div>
              {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                          <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-lg font-bold text-gray-800">Create New Quotation</h3>
                            <button onClick={()=>setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
              
                          <form  className="p-4 w-full">
                            <div className="">
                              {/* Left Column - Compact Customer Info */}
                              <div className="space-y-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Customer Information
                                  </h4>
                                  
                                  <div className=" flex flex-wrap gap-2 ">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Name <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Customer name"
                                        required
                                      />
                                    </div>
              
                                    
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          <Phone className="w-3 h-3 inline mr-1" />
                                          Phone
                                        </label>
                                        <input
                                          type="tel"
                                          value={formData.customer_phone}
                                          onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                          placeholder="Phone number"
                                        />
                                      </div>
              
                                      
                                  
              
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        <MapPin className="w-3 h-3 inline mr-1" />
                                        Address
                                      </label>
                                      <textarea
                                        value={formData.customer_address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                                        rows="2"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        placeholder="Customer address"
                                      />
                                    </div>
                                  </div>
                                </div>
                                </div>
              
                                {/* Product Search - Compact */}
                                
                              </div>
                                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">Add Products</h4>
                              <div className="bg-gray-50 p-3 w-[100%] rounded-lg flex ">
                                  
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <input
                                          type="text"
                                          value={searchTerm}
                                          onChange={handleSearchChange}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                          placeholder="Search products..."
                                        />
                                      </div>
              
                                      <div>
                                        <select
                                          value={selectedCategory}
                                          onChange={handleCategoryChange}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        >
                                          <option value="">All Categories</option>
                                          {categoryList.map(category => (
                                            <option key={category.category_id} value={category.category_id}>
                                              {category.category_name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
              
                                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                                      {products.map(product => (
                                        <div
                                          key={product.product_id}
                                          className="flex items-center justify-between p-2 border-b border-gray-200 hover:bg-white cursor-pointer text-sm"
                                          onClick={() => addProductToQuotation(product)}
                                        >
                                          <div>
                                            <div className="font-medium">{product.product_name}</div>
                                            <div className="text-xs text-gray-500">
                                              ₹{product.price} | Stock: {product.stock_quantity}
                                            </div>
                                          </div>
                                          <Plus className="w-4 h-4 text-green-600" />
                                        </div>
                                      ))}
                                    </div>
                                  

                                  </div>
                                   <div className="space-y-4">
                                {/* Selected Items - Compact */}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">Bill Items ({formData.items.length})</h4>
                                  
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {formData.items.length === 0 ? (
                                      <div className="text-center text-gray-500 text-sm py-4">
                                        No items added
                                      </div>
                                    ) : (
                                      formData.items.map((item) => (
                                        <div key={item.product_id} className="flex items-center justify-between p-2 bg-white rounded border">
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{item.product_name}</div>
                                            <div className="text-xs text-gray-500">₹{item.price} × {item.quantity}</div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                              <button
                                                type="button"
                                                onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100"
                                              >
                                                -
                                              </button>
                                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                                              <button
                                                type="button"
                                                onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center border rounded hover:bg-gray-100"
                                              >
                                                +
                                              </button>
                                            </div>
                                            <div className="w-16 text-right font-medium text-sm">
                                              ₹{item.total}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => removeItemFromBill(item.product_id)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <X className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
              
                                {/* Bill Summary - Compact */}
                                
                              </div>
                              
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">Bill Summary</h4>
                                  
                                  <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                      <span>Subtotal:</span>
                                      <span className="font-medium">₹{subtotal}</span>
                                    </div>
              
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Discount (₹)
                                        </label>
                                        <input
                                          type="number"
                                          value={formData.discount_amount}
                                          onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            discount_amount: e.target.value,
                                            discount_percentage: '' 
                                          }))}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                          placeholder="0.00"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Discount (%)
                                        </label>
                                        <input
                                          type="number"
                                          value={formData.discount_percentage}
                                          onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            discount_percentage: e.target.value,
                                            discount_amount: '' 
                                          }))}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                          placeholder="0"
                                        />
                                      </div>
                                    </div>
              
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Tax (₹)
                                        </label>
                                        <input
                                          type="number"
                                          value={formData.gst_amount}
                                          onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            gst_amount: e.target.value,
                                            gst_percentage: '' 
                                          }))}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                          placeholder="0.00"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Tax (%)
                                        </label>
                                        <input
                                          type="number"
                                          value={formData.gst_percentage}
                                          onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            gst_percentage: e.target.value,
                                            gst_amount: '' 
                                          }))}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                          placeholder="0"
                                        />
                                      </div>

                                    </div>
                                     <div className='w-[50%]'>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Shipping Charges
                                        </label>
                                        <input
                                          type="number"
                                          value={formData.shipping_charges}
                                          onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            shipping_charges: e.target.value,
                                             
                                          }))}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                          placeholder="0"
                                        />
                                      </div>
              
                                    <div className="border-t pt-3">
                                      <div className="flex justify-between font-bold">
                                        <span>Total:</span>
                                        <span className="text-green-600">₹{total}</span>
                                      </div>
                                    </div>
                                  </div>
              
                                  
                                </div>
              
                              {/* Right Column - Bill Summary */}
                             
                           
              
                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                              <button
                                type="button"
                                // onClick={closeCreateModal}
                                // disabled={loading}
                                onClick={()=>setShowModal(false)}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button> 
                              <button
                                type="submit"
                                onClick={handleSubmit}
                                // disabled={loading || formData.items.length === 0}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                              >
                                {/* {loading && <Loader2 className="w-4 h-4 animate-spin" />} */}
                                Create Quotation
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                   {selectedQuotation &&  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
   <div className="bg-white w-[70%] max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-4 relative">

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded"
            >
              Close
            </button>

            <QuotationViewPage quotationData={selectedQuotation} />
          </div>
</div>}

    </div>
  )
}

export default QuotationManagement
