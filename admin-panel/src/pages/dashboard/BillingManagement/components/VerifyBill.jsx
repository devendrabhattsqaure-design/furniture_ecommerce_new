import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Loader2,
  CheckCircle,
  XCircle,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Banknote,
  FileText,
  Truck
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

const VerifyBill = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [generatingPDF, setGeneratingPDF] = useState(false);
  const [verified, setVerified] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    verifyBill();
  }, [billId]);

  const verifyBill = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bills/verify/${billId}`);
      
      if (response.ok) {
        const data = await response.json();
        setBill(data.data);
        setVerified(true);
        console.log("truebmndsfb");
        
        toast.success("Bill verified successfully!");
      } else {
        setVerified(false);
        toast.error("Bill not found or invalid");
      }
    } catch (error) {
      console.error('Error verifying bill:', error);
      setVerified(false);
      toast.error("Error verifying bill");
    } finally {
      setLoading(false);
    }
  };

  const printById = () => {
    window.print();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      printById();
    }, 3000); 

    return () => clearTimeout(timer); 
  }, []);
  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch(method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cheque': return <FileText className="w-4 h-4" />;
      case 'upi': return <CreditCard className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
    }
  };

  // Print styles
  const PrintStyles = () => (
    <style>{`
      @media print {
        #header, #summarycards, .no-print {
          display: none !important;
        }
        
        body * {
          visibility: hidden !important;
        }
        #invoice, #invoice * {
          visibility: visible !important;
        }
        #invoice {
          position: absolute;
          top: 0;
          left: 0;
          width: 210mm;
          padding: 10mm 8mm;
          box-shadow: none !important;
          border: none !important;
        }
        @page {
          size: A4;
          margin: 10mm;
        }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Bill</h3>
          <p className="text-gray-600 mb-6">The QR code you scanned is invalid or has expired.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <ToastContainer />
      <PrintStyles />
      
      {/* Header with Verification Status */}
      <div id="header" className="mb-6 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back Home
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Verified Bill Details</h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  #{bill.bill_number}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  VERIFIED
                </span>
              </div>
            </div>
            <p className="text-gray-600 mt-1">
              {new Date(bill.created_at).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
         
            <button
              onClick={printById}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
        
       
        
      </div>

      {/* Invoice Preview */}
      <div className="px-4 max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div id="summarycards" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Total Amount</p>
            <p className="text-xl font-bold text-gray-900">
              ₹{parseFloat(bill.total_amount).toLocaleString('en-IN')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Amount Paid</p>
            <p className="text-xl font-bold text-green-600">
              ₹{parseFloat(bill.paid_amount || 0).toLocaleString('en-IN')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Balance Due</p>
            <p className="text-xl font-bold text-red-600">
              ₹{parseFloat(bill.due_amount || 0).toLocaleString('en-IN')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <p className="text-sm font-medium text-gray-600">Payment Status</p>
            <p className={`text-xl font-bold ${
              bill.payment_status === 'paid' ? 'text-green-600' :
              bill.payment_status === 'partial' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {bill.payment_status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Invoice Template */}
        <div id="invoice" className="bg-white rounded-lg shadow-lg border overflow-hidden mb-8">
          {/* Invoice Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex justify-between items-start">
              {/* Company Info */}
              <div>
                {bill.org_logo ? (
                  <img 
                    src={bill.org_logo} 
                    alt={bill.org_name} 
                    className="h-16 mb-4"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{bill.org_name}</h1>
                )}
                <div className="text-sm text-gray-600">
                  <div>{bill.address}</div>
                  {bill.primary_phone && <div>Phone: {bill.primary_phone}</div>}
                  {bill.gst_number && <div className="font-semibold mt-1">GSTIN: {bill.gst_number}</div>}
                </div>
              </div>
              
              {/* Invoice Title */}
              <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">TAX INVOICE</h2>
                <div className="text-lg font-semibold text-gray-700">#{bill.bill_number}</div>
                <div className="text-sm text-gray-600 mt-2">
                  <div>Date: {new Date(bill.created_at).toLocaleDateString('en-IN')}</div>
                  <div>Time: {new Date(bill.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-green-600 font-semibold mt-1">✓ VERIFIED BILL</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Billing Details */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bill To */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">BILL TO:</h3>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-900">{bill.customer_name}</div>
                  {bill.customer_phone && <div className="text-gray-600">📞 {bill.customer_phone}</div>}
                  {bill.customer_email && <div className="text-gray-600">✉️ {bill.customer_email}</div>}
                  {bill.customer_address && (
                    <div className="text-gray-600 mt-2">{bill.customer_address}</div>
                  )}
                </div>
              </div>
              
              {/* Invoice Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">INVOICE DETAILS:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bill No:</span>
                    <span className="font-medium">{bill.bill_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium flex items-center gap-1">
                      {getPaymentIcon(bill.payment_method)}
                      {bill.payment_method.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issued By:</span>
                    <span className="font-medium">{bill.created_by_name || 'System'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      bill.payment_status === 'paid' ? 'text-green-600' :
                      bill.payment_status === 'partial' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {bill.payment_status.toUpperCase()}
                    </span>
                  </div>
                  {bill.due_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">
                        {new Date(bill.due_date).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="p-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">#</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">DESCRIPTION</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">SKU</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">UNIT PRICE</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">QUANTITY</th>
                  <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {bill.items?.map((item, index) => (
                  <tr key={item.bill_item_id || index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-3">
                      <div className="font-medium text-gray-900">{item.product_name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-3">{item.sku || 'N/A'}</td>
                    <td className="border border-gray-300 p-3">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-3 font-medium">
                      ₹{parseFloat(item.total_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="p-8 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="">SUBTOTAL</span>
                    <span className="font-medium">₹{parseFloat(bill.subtotal).toFixed(2)}</span>
                  </div>
                  
                  {bill.discount_amount > 0 && (
                    <div className="flex justify-between ">
                      <span>DISCOUNT</span>
                      <span>-₹{parseFloat(bill.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bill.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>GST ({bill.gst_percentage || 0}%)</span>
                      <span>₹{parseFloat(bill.tax_amount).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bill.shipment_charges > 0 && (
                    <div className="flex justify-between">
                      <span>SHIPMENT CHARGES</span>
                      <span>₹{parseFloat(bill.shipment_charges).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bill.installation_charges > 0 && (
                    <div className="flex justify-between">
                      <span>INSTALLATION CHARGES</span>
                      <span>₹{parseFloat(bill.installation_charges).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-300">
                    <div className="flex justify-between text-lg font-bold">
                      <span>TOTAL AMOUNT</span>
                      <span>₹{parseFloat(bill.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {bill.paid_amount > 0 && (
                    <div className="flex justify-between ">
                      <span>PAID AMOUNT</span>
                      <span>₹{parseFloat(bill.paid_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bill.due_amount > 0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>BALANCE DUE</span>
                      <span>₹{parseFloat(bill.due_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bill.payment_method === 'cheque' && bill.cheque_number && (
                    <div className="flex justify-between">
                      <span>CHEQUE NO</span>
                      <span>{bill.cheque_number}</span>
                    </div>
                  )}
                  
                  {bill.transaction_id && (
                    <div className="flex justify-between">
                      <span>TRANSACTION ID</span>
                      <span>{bill.transaction_id}</span>
                    </div>
                  )}
                  
                  {bill.bank_name && (
                    <div className="flex justify-between">
                      <span>BANK</span>
                      <span>{bill.bank_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default VerifyBill;