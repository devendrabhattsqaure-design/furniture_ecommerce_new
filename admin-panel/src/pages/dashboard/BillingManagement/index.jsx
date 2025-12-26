// admin-panel/src/pages/dashboard/BillingManagement/index.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  FileText, 
  DollarSign, 
  Package, 
  Plus,
  Eye,
  Building,
  Phone,
  User,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { FaRupeeSign } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentModal from "./components/PaymentModal";

const BillingManagement = () => {
  const [bills, setBills] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const navigate = useNavigate();

  const  API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const getOrgId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.org_id || null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    fetchOrganization();
    fetchBills();
  }, []);

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
        setOrganization(data.data);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bills`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': getOrgId()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBills(data.data || []);
      } else {
        toast.error("Failed to fetch bills");
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error("Error loading bills");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (bill) => {
    setSelectedBillForPayment(bill);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedBillForPayment(null);
  };

  const handlePaymentUpdate = () => {
    fetchBills();
  };

  const handleCreateBill = () => {
    navigate('/dashboard/billing-management/create');
  };

  const handleViewBill = (bill) => {
    navigate(`/dashboard/billing-management/${bill.bill_id}`);
  };

  const filteredBills = bills.filter(bill => 
    bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
  totalBills: bills.length,
  totalRevenue: Math.floor(
    bills.reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0)
  ),
  totalPaid: Math.floor(
    bills.reduce((sum, bill) => sum + Number(bill.paid_amount || 0), 0)
  ),
  totalDue: Math.floor(
    bills.reduce((sum, bill) => sum + Number(bill.due_amount || 0), 0)
  ),
  totalItems: bills.reduce((sum, bill) => sum + Number(bill.total_quantity || 0), 0)
};


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/home')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing Management</h1>
        <p className="text-gray-600">Create and manage customer bills</p>
      </div>

      {/* Organization Info */}
      {organization && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Building className="w-6 h-6" />
                  {organization.org_name}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({organization.gst_number || 'No GST'})
                  </span>
                </h1>
                <p className="text-gray-600 mt-1">{organization.address}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {organization.primary_phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {organization.contact_person_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalBills}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaRupeeSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Items Sold</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaRupeeSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{stats.totalPaid.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaRupeeSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Dues</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{stats.totalDue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bills by number, customer name, or phone..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleCreateBill}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create New Bill
          </button>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Recent Bills</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No bills found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Bill No.</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Customer</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Total</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Paid</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Due</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill.bill_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-blue-600">{bill.bill_number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{bill.customer_name}</div>
                      {bill.customer_phone && (
                        <div className="text-xs text-gray-500">{bill.customer_phone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(bill.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ₹{Math.floor(bill.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      ₹{Math.floor(bill.paid_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-red-600 font-medium">
                      ₹{Math.floor(bill.due_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        bill.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        bill.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bill.payment_status === 'paid' ? 'Paid' :
                         bill.payment_status === 'partial' ? 'Partial' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewBill(bill)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {bill.due_amount > 0 && (
                          <button
                            onClick={() => openPaymentModal(bill)}
                            className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1"
                          >
                            <FaRupeeSign className="w-4 h-4" />
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedBillForPayment && (
        <PaymentModal
          bill={selectedBillForPayment}
          onClose={closePaymentModal}
          onSuccess={handlePaymentUpdate}
        />
      )}
    </div>
  );
};

export default BillingManagement;