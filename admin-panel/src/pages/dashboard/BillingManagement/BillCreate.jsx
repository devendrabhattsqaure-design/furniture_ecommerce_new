import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  X, 
  Loader2,
  Search,
  Package,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Truck,
  CreditCard,
  ShoppingBag,
  Calendar,
  FileText,
  Percent,
  Shield
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRupeeSign } from "react-icons/fa";

const BillCreate = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    items: [],
    gst_type: 'with_gst',
    gst_percentage: '',
    installation_charges: '', 
    discount_amount: '',
    discount_percentage: '',
    tax_amount: '',
    tax_percentage: '',
    shipment_charges: '',
    payment_method: 'cash',
    transaction_id: '',
    cheque_number: '',
    bank_name: '',
    notes: '',
    paid_amount: '',
    due_date: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getOrgId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.org_id || null;
    } catch (e) {
      return null;
    }
  };

  const fetchOrganization = async () => {
    try {
      const token = localStorage.getItem('token');
      const orgId = getOrgId();
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data.data)
        setOrganization(data.organization);
        if (data.data.gst_type) {
          setFormData(prev => ({ ...prev, gst_type: data.data.gst_type }));
        }
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': getOrgId()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchProducts = async (search = '', categoryId = '') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryId) params.append('category_id', categoryId);

      const response = await fetch(`${API_BASE_URL}/bills/products/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': getOrgId()
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

  useEffect(() => {
    fetchOrganization();
    fetchCategories();
    searchProducts();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchProducts(value, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    searchProducts(searchTerm, value);
  };

  const addProductToBill = (product) => {
    const existingItem = formData.items.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      const updatedItems = formData.items.map(item =>
        item.product_id === product.product_id
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              total: parseFloat(product.price) * (item.quantity + 1)
            }
          : item
      );
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      const newItem = {
        product_id: product.product_id,
        product_name: product.product_name,
        sku: product.sku,
        price: parseFloat(product.price),
        quantity: 1,
        total: parseFloat(product.price)
      };
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
    
    toast.success(`${product.product_name} added to bill`);
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
            total: parseFloat(item.price) * newQuantity
          }
        : item
    );
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItemFromBill = (productId) => {
    const updatedItems = formData.items.filter(item => item.product_id !== productId);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotals = () => {
    const itemsWithTotals = formData.items.map(item => ({
      ...item,
      total: parseFloat(item.price || 0) * parseInt(item.quantity || 0)
    }));

    const subtotal = itemsWithTotals.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    
    let discount = 0;
    if (formData.discount_amount && !isNaN(parseFloat(formData.discount_amount))) {
      discount = parseFloat(formData.discount_amount);
    } else if (formData.discount_percentage && !isNaN(parseFloat(formData.discount_percentage))) {
      discount = (subtotal * parseFloat(formData.discount_percentage)) / 100;
    }

    let tax = 0;
    if (formData.gst_type === 'with_gst') {
      if (formData.tax_amount && !isNaN(parseFloat(formData.tax_amount))) {
        tax = parseFloat(formData.tax_amount);
      } else if (formData.tax_percentage && !isNaN(parseFloat(formData.tax_percentage))) {
        tax = ((subtotal - discount) * parseFloat(formData.tax_percentage)) / 100;
      } else if (organization && organization.gst_percentage) {
        tax = ((subtotal - discount) * parseFloat(organization.gst_percentage)) / 100;
      }
    }

    const shipment = parseFloat(formData.shipment_charges) || 0;
    const installation = parseFloat(formData.installation_charges) || 0;

    const total = parseFloat((subtotal - discount + tax + shipment + installation).toFixed(1));
    
    const paidAmount = parseFloat(formData.paid_amount) || 0;
    const dueAmount = Math.max(0, parseFloat((total - paidAmount).toFixed(1)));
    
    let paymentStatus = 'pending';
    if (paidAmount >= total) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    return { 
      subtotal: parseFloat(subtotal.toFixed(1)), 
      discount: parseFloat(discount.toFixed(1)), 
      tax: parseFloat(tax.toFixed(1)), 
      shipment: parseFloat(shipment.toFixed(1)),
      installation: parseFloat(installation.toFixed(1)),
      total,
      paidAmount: parseFloat(paidAmount.toFixed(1)),
      dueAmount: parseFloat(dueAmount.toFixed(1)),
      paymentStatus
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name) {
      toast.error("Customer name is required");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one product to the bill");
      return;
    }

    setLoading(true);

    try {
      const totals = calculateTotals();
      const token = localStorage.getItem('token');
      
      const billData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone || '',
        customer_email: formData.customer_email || '',
        customer_address: formData.customer_address || '',
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity)
        })),
        gst_type: formData.gst_type,
        discount_amount: totals.discount > 0 ? totals.discount.toString() : '',
        discount_percentage: formData.discount_percentage || '',
        tax_amount: totals.tax > 0 ? totals.tax.toString() : '',
        tax_percentage: formData.tax_percentage || '',
        shipment_charges: formData.shipment_charges || '0',
        installation_charges: formData.installation_charges || '0',
        payment_method: formData.payment_method,
        transaction_id: formData.transaction_id || '',
        cheque_number: formData.cheque_number || '',
        bank_name: formData.bank_name || '',
        notes: formData.notes || '',
        paid_amount: formData.paid_amount || '0',
        due_date: formData.due_date || null
      };

      const response = await fetch(`${API_BASE_URL}/bills`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-org-id': getOrgId()
        },
        body: JSON.stringify(billData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Bill created successfully!");
        navigate('/dashboard/billing-management');
        if (data.data.qr_code_url) {
          setQrCodeUrl(data.data.qr_code_url);
          setShowQRModal(true);
        } else {
          navigate('/dashboard/billing-management');
        }
      } else {
        console.error('Error response:', data);
        toast.error(data.message || "Failed to create bill");
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discount, tax, shipment, installation, total, paidAmount, dueAmount, paymentStatus } = calculateTotals();

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      payment_method: method,
      transaction_id: '',
      cheque_number: '',
      bank_name: ''
    }));
  };
  const [errors, setErrors] = useState({});

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // allow only digits

    // limit to 10 digits
    if (value.length > 10) return;

    setFormData((prev) => ({
      ...prev,
      customer_phone: value,
    }));

    // validation
    if (value.length !== 10) {
      setErrors((prev) => ({
        ...prev,
        customer_phone: "Phone number must be 10 digits",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        customer_phone: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <ToastContainer />

      {/* Header */}
      <div className="mb-6 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard/billing-management')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bills
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Bill</h1>
                <p className="text-gray-600">Add customer details, products, and calculate the bill</p>
              </div>
            </div>
          </div>
          {organization && (
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{organization.org_name}</p>
                  <p className="text-sm text-gray-500">GST: {organization.gst_type === 'with_gst' ? `${organization.gst_percentage || 0}%` : 'No GST'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 max-w-7xl mx-auto">
        {/* TOP SECTION: Customer Info & Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                Customer Information
              </h2>
              <div className="text-sm text-gray-500">
                {formData.items.length} item{formData.items.length !== 1 ? 's' : ''} added
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Customer name"
                  required
                />
              </div>

              <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
        <Phone className="w-4 h-4" />
        Phone Number
      </label>

      <input
        type="tel"
        value={formData.customer_phone}
        onChange={handlePhoneChange}
        className={`w-full px-4 py-2.5 border rounded-lg 
          ${errors.customer_phone ? "border-red-500" : "border-gray-300"}`}
        placeholder="Enter 10-digit phone number"
      />

      {errors.customer_phone && (
        <p className="text-sm text-red-500 mt-1">
          {errors.customer_phone}
        </p>
      )}
    </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="Email address"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">GST Options</h3>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="with_gst"
                    checked={formData.gst_type === 'with_gst'}
                    onChange={(e) => setFormData(prev => ({ ...prev, gst_type: e.target.value }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">With GST ({organization?.gst_percentage || 0}%)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="without_gst"
                    checked={formData.gst_type === 'without_gst'}
                    onChange={(e) => setFormData(prev => ({ ...prev, gst_type: e.target.value }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Without GST</span>
                </label>
              </div>
              </div>
             

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <textarea
                  value={formData.customer_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="Customer address"
                />
              </div>
            </div>

            
          </div>

          {/* Right Column - Product Search */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Search className="w-5 h-5 text-green-600" />
              </div>
              Add Products
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
                    placeholder="Search products..."
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {products.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No products found</p>
                  </div>
                ) : (
                  products.map(product => (
                    <div
                      key={product.product_id}
                      className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addProductToBill(product)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.product_name}</div>
                        <div className="text-sm text-gray-500">
                          SKU: {product.sku} | Stock: {product.stock_quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">₹{product.price}</div>
                        <button
                          type="button"
                          className="mt-1 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Selected Items */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              Selected Items
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({formData.items.length})
              </span>
            </h2>
            {formData.items.length > 0 && (
              <div className="text-sm text-gray-600">
                Subtotal: <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
          
          {formData.items.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No items added yet. Search and add products above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.items.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.product_name}</div>
                    <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <div className="w-24 text-right">
                      <div className="font-medium">₹{item.price}</div>
                      <div className="text-xs text-gray-500">each</div>
                    </div>
                    <div className="w-24 text-right">
                      <div className="font-bold text-gray-900">₹{item.total}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItemFromBill(item.product_id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: Billing Calculation & Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Charges & Calculations */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
           
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FaRupeeSign className="w-5 h-5 text-purple-600" />
                </div>
                Bill Calculation
              </h2>
              
              <div className="space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Discount */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        {/* <Percent className="w-4 h-4" /> */}
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span>Discount Applied</span>
                      <span className="font-medium">-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Additional Charges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Shipment Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.shipment_charges}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        shipment_charges: e.target.value
                      }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Installation Charges (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.installation_charges}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        installation_charges: e.target.value
                      }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Tax Section */}
                {formData.gst_type === 'with_gst' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tax Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.tax_amount}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            tax_amount: e.target.value,
                            tax_percentage: '' 
                          }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tax Percentage (%)
                        </label>
                        <input
                          type="number"
                          value={formData.tax_percentage}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            tax_percentage: e.target.value,
                            tax_amount: '' 
                          }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                          placeholder={organization?.gst_percentage || "0"}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    {tax > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>GST Tax ({formData.tax_percentage || organization?.gst_percentage || 0}%)</span>
                        <span className="font-medium">+₹{tax.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                <div className="pt-4 border-t space-y-2">
                  {shipment > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Shipment Charges</span>
                      <span className="font-medium">+₹{shipment.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  
                  {installation > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Installation Charges</span>
                      <span className="font-medium">+₹{installation.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t text-lg font-bold">
                    <span className="text-gray-900">Grand Total</span>
                    <span className="text-blue-600">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
            
            </div>
          </div>

          {/* Right Column - Payment & Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
          
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                Payment Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                {(formData.payment_method === 'upi' || formData.payment_method === 'card') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={formData.transaction_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, transaction_id: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                      placeholder="Enter transaction ID"
                    />
                  </div>
                )}

                {formData.payment_method === 'cheque' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cheque Number
                      </label>
                      <input
                        type="text"
                        value={formData.cheque_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, cheque_number: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                        placeholder="Cheque number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bank_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                        placeholder="Bank name"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Paid (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        paid_amount: e.target.value
                      }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max={total}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Amount Paid:</span>
                    <span className="font-medium text-green-600">
                      ₹{paidAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Balance Due:</span>
                    <span className={`font-medium ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{dueAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {dueAmount > 0 && (
                    <div className={`text-sm p-2 rounded mt-2 ${
                      paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      This will create a {paymentStatus} payment bill
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    placeholder="Additional notes for this bill..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || formData.items.length === 0 || !formData.customer_name}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Bill...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Bill
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {formData.items.length === 0 
                      ? 'Add at least one product to continue' 
                      : !formData.customer_name 
                        ? 'Customer name is required'
                        : 'Review and submit your bill'
                    }
                  </p>
                </div>
              </div>
           
          </div>
        </div>
      </form>
    </div>
  );
};

export default BillCreate;