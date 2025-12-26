import React, { useState, useEffect } from "react";
import { 
  DollarSign, CreditCard, Users, Download, 
  Filter, Search, Calendar, TrendingUp,
  FileText, Receipt, User, Phone, Clock,
  Wallet, CheckCircle, AlertCircle // Added new icons
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
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
    payment_type: 'all', // Added: 'all', 'initial', 'dues'
    page: 1,
    limit: 10
  });
  const [activeTab, setActiveTab] = useState('payments');

 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchBusinessReport();
    fetchPayments();
  }, [paymentFilter.page, paymentFilter.payment_type]);

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
      
      // Use business-report/payments if payments endpoint doesn't exist
      const response = await fetch(`${API_BASE_URL}/business-report/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentData(data.data);
      } else {
        // Try the regular payments endpoint
        const response2 = await fetch(`${API_BASE_URL}/payments?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response2.ok) {
          const data = await response2.json();
          setPaymentData(data.data);
        } else {
          console.log('Payment routes not available yet');
          setPaymentData({
            payments: [],
            summary: {
              total_payments: 0,
              total_amount: 0,
              total_initial: 0,
              total_dues: 0,
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
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPaymentData({
        payments: [],
        summary: {
          total_payments: 0,
          total_amount: 0,
          total_initial: 0,
          total_dues: 0,
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
      payment_type: 'all',
      page: 1,
      limit: 10
    });
  };

  const exportPaymentsToExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...paymentFilter,
        limit: 1000
      });
      
      let response;
      
      // Try business-report/payments first
      response = await fetch(`${API_BASE_URL}/business-report/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Try regular payments endpoint
        response = await fetch(`${API_BASE_URL}/payments?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        
        if (!data.data || !data.data.payments || data.data.payments.length === 0) {
          toast.info("No payment records to export");
          return;
        }
        
        // Create CSV content
        const headers = ['Date', 'Bill No.', 'Customer', 'Phone', 'Payment Amount', 'Type', 'Previous Due', 'New Due', 'Method', 'Notes', 'Collected By'];
        const rows = data.data.payments.map(payment => [
          new Date(payment.payment_date).toLocaleDateString(),
          payment.bill_number || 'N/A',
          payment.customer_name || 'N/A',
          payment.customer_phone || 'N/A',
          payment.payment_amount || '0',
          payment.previous_due === payment.payment_amount ? 'Initial' : 'Dues',
          payment.previous_due || '0',
          payment.new_due || '0',
          payment.payment_method || 'cash',
          payment.notes || '',
          payment.collected_by_name || 'N/A'
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `All_Payments_${new Date().toISOString().split('T')[0]}.csv`;
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
      
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to determine payment type
  const getPaymentType = (payment) => {
    const prevDue = parseFloat(payment.previous_due || 0);
    const paymentAmt = parseFloat(payment.payment_amount || 0);
    
    // If previous due equals payment amount (or very close), it's likely an initial payment
    if (Math.abs(prevDue - paymentAmt) < 0.01) {
      return 'Initial';
    } else if (payment.notes && payment.notes.toLowerCase().includes('initial')) {
      return 'Initial';
    } else if (paymentAmt < prevDue) {
      return 'Dues';
    }
    return 'Payment';
  };

  // Filter payments based on payment_type
  const filteredPayments = paymentData?.payments ? paymentData.payments.filter(payment => {
    if (paymentFilter.payment_type === 'all') return true;
    const type = getPaymentType(payment);
    if (paymentFilter.payment_type === 'initial') return type === 'Initial';
    if (paymentFilter.payment_type === 'dues') return type === 'Dues';
    return true;
  }) : [];

  if (loading && !paymentData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      
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
                  <FaRupeeSign className="w-4 h-4" />
                  All Payment Records
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <select
                  name="payment_type"
                  value={paymentFilter.payment_type}
                  onChange={handlePaymentFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Payments</option>
                  <option value="initial">Initial Payments</option>
                  <option value="dues">Dues Payments</option>
                </select>
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
                    <p className="text-xl font-bold text-gray-900">{paymentData.summary.total_payments || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Wallet className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(paymentData.summary.total_amount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Initial Payments</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(paymentData.summary.total_initial || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dues Payments</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(paymentData.summary.total_dues || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
  <div className="flex justify-between items-center mb-2">
    <div>
      <h3 className="text-lg font-semibold inline-block mr-4">
        {paymentFilter.payment_type === 'all' ? 'All Payment Records' : 
         paymentFilter.payment_type === 'initial' ? 'Initial Payments' : 'Dues Payments'}
      </h3>
      <span className="text-sm text-gray-600">
        ({filteredPayments.length} records)
      </span>
    </div>
    
    {/* Total Collected and Total Dues on the right side */}
    <div className="text-sm">
      <span className="text-gray-600">Collected: </span>
      <span className="font-bold text-green-600 mr-4">
        {formatCurrency(
          filteredPayments.reduce((sum, payment) => 
            sum + Math.ceil(payment.payment_amount || 0), 0
          )
        )}
      </span>
      
      <span className="text-gray-600">Dues: </span>
      <span className="font-bold text-red-600">
        {formatCurrency(
          filteredPayments.reduce((sum, payment) => 
            sum + Math.ceil(payment.new_due || 0), 0
          )
        )}
      </span>
    </div>
  </div>
</div>
            
            {filteredPayments.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No payment records found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {paymentFilter.payment_type === 'initial' 
                    ? 'Initial payments will appear here when bills are created with upfront payment.'
                    : paymentFilter.payment_type === 'dues'
                    ? 'Dues payments will appear here when customers pay outstanding amounts.'
                    : 'Payment records will appear here when bills are created or dues are paid.'}
                </p>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous Due</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Due</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected By</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPayments.map((payment) => {
                        const paymentType = getPaymentType(payment);
                        return (
                          <tr key={payment.payment_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div>{formatDate(payment.payment_date)}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-medium">{payment.customer_name || 'N/A'}</div>
                              {payment.customer_phone && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {payment.customer_phone}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-blue-600">{payment.bill_number || 'N/A'}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-bold text-green-600">
                                {formatCurrency(Math.ceil(payment.payment_amount))}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                paymentType === 'Initial' 
                                  ? 'bg-green-100 text-green-800'
                                  : paymentType === 'Dues'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {paymentType}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-red-600">
                              {formatCurrency(Math.ceil(payment.previous_due))}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`font-medium ${(parseFloat(payment.new_due) || 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                {formatCurrency(Math.ceil(payment.new_due))}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {payment.payment_method || 'cash'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {payment.collected_by_name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                              {payment.notes || '-'}
                            </td>
                          </tr>
                        );
                      })}
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
                  onChange={(e) => setFilter(prev => ({ ...prev, report_type: e.target.value }))}
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
                      onChange={(e) => setFilter(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={filter.end_date}
                      onChange={(e) => setFilter(prev => ({ ...prev, end_date: e.target.value }))}
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
                  <FaRupeeSign className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(Math.ceil(reportData.summary.today.total_sales))}
              </h3>
              <p className="text-gray-600">Total Sales</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Bills</p>
                  <p className="font-semibold">{reportData.summary.today.total_bills}</p>
                </div>
                <div>
                  <p className="text-gray-500">Collected</p>
                  <p className="font-semibold">{formatCurrency(Math.ceil(reportData.summary.today.total_collected))}</p>
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
                {formatCurrency(Math.ceil(reportData.summary.monthly.total_sales))}
              </h3>
              <p className="text-gray-600">Monthly Sales</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Bills</p>
                  <p className="font-semibold">{Math.ceil(reportData.summary.monthly.total_bills)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Bill</p>
                  <p className="font-semibold">{formatCurrency(Math.ceil(reportData.summary.monthly.average_bill_value))}</p>
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
                {formatCurrency(Math.ceil(reportData.summary.dues.total_due_amount))}
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
                  <p className="font-semibold">{formatCurrency(Math.ceil(reportData.summary.customers.average_spend))}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Add missing exportToExcel function
const exportToExcel = async () => {
  try {
    const token = localStorage.getItem('token');
    const API_BASE_URL = "http://localhost:5000/api";
    const filter = {
      report_type: 'today',
      start_date: '',
      end_date: ''
    };
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

export default BusinessReport;