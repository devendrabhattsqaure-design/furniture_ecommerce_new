import React, { useState, useEffect } from "react";
import { 
  TrendingUp, DollarSign, CreditCard, Clock, 
  Users, Package, Download, Calendar, Filter,
  FileText, PieChart, BarChart3, Activity
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BusinessReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    report_type: 'today',
    start_date: '',
    end_date: ''
  });
  const [activeTab, setActiveTab] = useState('summary');

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchBusinessReport();
  }, []);

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    fetchBusinessReport();
  };

  const handleResetFilter = () => {
    setFilter({
      report_type: 'today',
      start_date: '',
      end_date: ''
    });
    fetchBusinessReport();
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
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
        {/* <div className="flex justify-between items-center mb-4"> */}
          {/* <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Report</h1>
            <p className="text-gray-600">Track your business performance and financial insights</p>
          </div> */}
          
        {/* </div> */}

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
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
            <div className="flex items-center gap-4">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
          </div>
          
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['summary', 'trends', 'customers', 'products', 'dues'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Summary Cards */}
      {activeTab === 'summary' && reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Income */}
            <div className="bg-white rounded-lg shadow-md p-6">
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
            <div className="bg-white rounded-lg shadow-md p-6">
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
            <div className="bg-white rounded-lg shadow-md p-6">
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
            <div className="bg-white rounded-lg shadow-md p-6">
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

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Payment Methods Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportData.payment_methods.map((method, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{method.payment_method}</span>
                    <CreditCard className="w-5 h-5 text-gray-500" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(method.total_amount)}</p>
                  <p className="text-sm text-gray-600">{method.bill_count} bills</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && reportData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Trend (Last 30 Days)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bills</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.daily_trend.map((day, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">{day.sale_date}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{day.bill_count}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{formatCurrency(day.daily_sales)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(day.daily_collection)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(day.daily_due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && reportData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Times Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.top_products.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">{product.product_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{product.sku}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{product.category_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{product.total_quantity_sold}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{formatCurrency(product.total_revenue)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{product.times_sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dues Tab */}
      {activeTab === 'dues' && reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dues Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Dues Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Due Amount</span>
                <span className="text-xl font-bold text-red-600">
                  {formatCurrency(reportData.summary.dues.total_due_amount)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending Bills</p>
                  <p className="text-2xl font-bold">{reportData.summary.dues.pending_bills}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Partial Bills</p>
                  <p className="text-2xl font-bold">{reportData.summary.dues.partial_bills}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Bill Status Distribution</h3>
            <div className="space-y-3">
              {reportData.bill_status.map((status, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      status.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      status.payment_status === 'pending' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {status.payment_status.toUpperCase()}
                    </span>
                    <span className="font-medium">{status.bill_count} bills</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-medium">{formatCurrency(status.total_amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Paid</p>
                      <p className="font-medium">{formatCurrency(status.paid_amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Due</p>
                      <p className="font-medium">{formatCurrency(status.due_amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && reportData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold">{reportData.summary.customers.total_customers}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">New Customers</p>
              <p className="text-3xl font-bold">{reportData.summary.customers.new_customers}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Average Spend</p>
              <p className="text-3xl font-bold">{formatCurrency(reportData.summary.customers.average_spend)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessReport;