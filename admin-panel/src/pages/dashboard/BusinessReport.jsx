import React, { useState, useEffect } from "react";
import { 
  DollarSign, CreditCard, Users, Download, 
  Filter, Search, Calendar, TrendingUp,
  FileText, Receipt, User, Phone, Clock
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BusinessReport = () => {
  const [reportData, setReportData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    report_type: 'today',
    start_date: '',
    end_date: ''
  });
  const [paymentFilter, setPaymentFilter] = useState({
    customer_name: '',
    customer_phone: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 10
  });
  const [activeTab, setActiveTab] = useState('payments');

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchBusinessReport();
    fetchPayments();
  }, [paymentFilter.page]);

  const fetchBusinessReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filter);
      
      const response = await fetch(`${API_BASE_URL}/business-report?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data.data);
      } else {
        toast.error("Failed to fetch business report");
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error("Error loading business report");
    } finally {
      setLoading(false);
    }
  };

 const fetchPayments = async () => {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(paymentFilter);
    
    const response = await fetch(`${API_BASE_URL}/payments?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setPaymentData(data.data);
    } else if (response.status === 404) {
      // Payment route not implemented yet
      console.log('Payment route not implemented');
      setPaymentData({
        payments: [],
        summary: {
          total_payments: 0,
          total_amount: 0,
          unique_customers: 0,
          payment_methods_used: 0
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });
    } else {
      toast.error("Failed to fetch payments");
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    // Don't show error if route doesn't exist yet
    setPaymentData({
      payments: [],
      summary: {
        total_payments: 0,
        total_amount: 0,
        unique_customers: 0,
        payment_methods_used: 0
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    });
  }
};

  const fetchPaymentSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filter);
      
      const response = await fetch(`${API_BASE_URL}/payments/summary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching payment summary:', error);
    }
    return null;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentFilterChange = (e) => {
    const { name, value } = e.target;
    setPaymentFilter(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleApplyFilter = () => {
    fetchBusinessReport();
  };

  const handleApplyPaymentFilter = () => {
    fetchPayments();
  };

  const handleResetFilter = () => {
    setFilter({
      report_type: 'today',
      start_date: '',
      end_date: ''
    });
    fetchBusinessReport();
  };

  const handleResetPaymentFilter = () => {
    setPaymentFilter({
      customer_name: '',
      customer_phone: '',
      start_date: '',
      end_date: '',
      page: 1,
      limit: 10
    });
  };

  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filter);
      
      const response = await fetch(`${API_BASE_URL}/business-report/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Business_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Report exported successfully!");
      } else {
        toast.error("Failed to export report");
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error("Error exporting report");
    }
  };

  const exportPaymentsToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...paymentFilter,
        limit: 1000 // Export more records
      });
      
      const response = await fetch(`${API_BASE_URL}/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Create CSV content
        const headers = ['Date', 'Bill No.', 'Customer', 'Phone', 'Payment Amount', 'Previous Due', 'New Due', 'Method', 'Collected By'];
        const rows = data.data.payments.map(payment => [
          new Date(payment.payment_date).toLocaleDateString(),
          payment.bill_number,
          payment.customer_name,
          payment.customer_phone,
          payment.payment_amount,
          payment.previous_due,
          payment.new_due,
          payment.payment_method,
          payment.collected_by_name
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payments_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Payments exported successfully!");
      } else {
        toast.error("Failed to export payments");
      }
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.error("Error exporting payments");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && !paymentData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Report</h1>
            <p className="text-gray-600">Track your business performance and payments</p>
          </div>
          
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payment Records
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Business Summary
                </div>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Payment Records Tab */}
      {activeTab === 'payments' && (
        <>
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Filter Payments</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  name="customer_name"
                  value={paymentFilter.customer_name}
                  onChange={handlePaymentFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                <input
                  type="text"
                  name="customer_phone"
                  value={paymentFilter.customer_phone}
                  onChange={handlePaymentFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by phone"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={paymentFilter.start_date}
                  onChange={handlePaymentFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={paymentFilter.end_date}
                  onChange={handlePaymentFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={handleApplyPaymentFilter}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Apply Filter
              </button>
              <button
                onClick={handleResetPaymentFilter}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
              >
                Reset
              </button>
              <button
                onClick={exportPaymentsToExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                <Download className="w-4 h-4" />
                Export Payments
              </button>
            </div>
          </div>

          {/* Payment Summary Stats */}
          {paymentData?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Receipt className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Payments</p>
                    <p className="text-xl font-bold text-gray-900">{paymentData.summary.total_payments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Todays's Payment</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(paymentData.summary.total_amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Customers</p>
                    <p className="text-xl font-bold text-gray-900">
                      {paymentData.summary.unique_customers}
                    </p>
                  </div>
                </div>
              </div> */}

              {/* <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Methods</p>
                    <p className="text-xl font-bold text-gray-900">
                      {paymentData.summary.payment_methods_used}
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payment Records</h3>
              <span className="text-sm text-gray-600">
                {paymentData?.pagination?.total || 0} records found
              </span>
            </div>
            
            {!paymentData?.payments || paymentData.payments.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No payment records found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill No.</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous Due</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Due</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentData.payments.map((payment) => (
                        <tr key={payment.payment_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div>{formatDate(payment.payment_date)}</div>
                            <div className="text-gray-500 text-xs">
                              {new Date(payment.payment_date).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium">{payment.customer_name}</div>
                            {payment.customer_phone && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {payment.customer_phone}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-mono text-blue-600">{payment.bill_number}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-bold text-green-600">
                              {formatCurrency(payment.payment_amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-red-600">
                            {formatCurrency(payment.previous_due)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`font-medium ${payment.new_due > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                              {formatCurrency(payment.new_due)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {payment.payment_method}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {payment.collected_by_name || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {paymentData?.pagination && paymentData.pagination.totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing page {paymentData.pagination.page} of {paymentData.pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPaymentFilter(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={paymentData.pagination.page <= 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPaymentFilter(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={paymentData.pagination.page >= paymentData.pagination.totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Business Summary Tab */}
      {activeTab === 'summary' && reportData && (
        <>
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 ">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Filter Report</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  name="report_type"
                  value={filter.report_type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="yearly">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              {filter.report_type === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={filter.start_date}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={filter.end_date}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-end gap-2">
                <button
                  onClick={handleApplyFilter}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Apply Filter
                </button>
                <button
                  onClick={handleResetFilter}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Income */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(reportData.summary.today.total_sales)}
              </h3>
              <p className="text-gray-600">Total Sales</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Bills</p>
                  <p className="font-semibold">{reportData.summary.today.total_bills}</p>
                </div>
                <div>
                  <p className="text-gray-500">Collected</p>
                  <p className="font-semibold">{formatCurrency(reportData.summary.today.total_collected)}</p>
                </div>
              </div>
            </div>

            {/* Monthly Income */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Monthly</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(reportData.summary.monthly.total_sales)}
              </h3>
              <p className="text-gray-600">Monthly Sales</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Bills</p>
                  <p className="font-semibold">{reportData.summary.monthly.total_bills}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Bill</p>
                  <p className="font-semibold">{formatCurrency(reportData.summary.monthly.average_bill_value)}</p>
                </div>
              </div>
            </div>

            {/* Total Dues */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-orange-600">Outstanding</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(reportData.summary.dues.total_due_amount)}
              </h3>
              <p className="text-gray-600">Total Dues</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Due Bills</p>
                  <p className="font-semibold">{reportData.summary.dues.total_due_bills}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pending</p>
                  <p className="font-semibold">{reportData.summary.dues.pending_bills}</p>
                </div>
              </div>
            </div>

            {/* Customers */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-purple-600">Customers</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {reportData.summary.customers.total_customers}
              </h3>
              <p className="text-gray-600">Total Customers</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">New</p>
                  <p className="font-semibold">{reportData.summary.customers.new_customers}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Spend</p>
                  <p className="font-semibold">{formatCurrency(reportData.summary.customers.average_spend)}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BusinessReport;