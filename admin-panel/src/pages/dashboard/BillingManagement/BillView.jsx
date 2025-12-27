import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Loader2,
  Copy,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  FileDigit,
  Truck,
  CreditCard,
  Banknote,
  FileText,
  QrCode, 
  Smartphone, 
  X
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const BillView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const API_BASE_URL = "http://localhost:5000/api";

  const getOrgId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.org_id || null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    fetchBill();
  }, [id]);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bills/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-org-id': getOrgId()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBill(data.data);
          console.log('Fetched bill data:', data.data);
        } else {
          toast.error(data.message);
          navigate('/dashboard/billing-management');
        }
      } else {
        toast.error("Failed to fetch bill details");
        navigate('/dashboard/billing-management');
      }
    } catch (error) {
      console.error('Error fetching bill details:', error);
      toast.error("Error loading bill details");
      navigate('/dashboard/billing-management');
    } finally {
      setLoading(false);
    }
  };

  const printById = () => {
    window.print();
  };

  const shareBill = async () => {
    if (!bill) return;
    
    try {
      const shareData = {
        title: `Bill #${bill.bill_number}`,
        text: `Bill from ${bill.org_name} - Total: ₹${bill.total_amount}`,
        url: `${window.location.origin}/verify-bill/${bill.bill_id}`
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Bill shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const downloadQRCode = () => {
    if (!bill?.qr_code_path) return;
    
    const link = document.createElement('a');
    link.href = bill.qr_code_path;
    link.download = `bill_${bill.bill_number}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  // QR Code Modal Component
  const QRCodeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bill QR Code</h3>
              <p className="text-sm text-gray-600">Scan to view bill details</p>
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center mb-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4">
              {bill?.qr_code_path ? (
                <img 
                  src={bill.qr_code_path} 
                  alt="Bill QR Code" 
                  className="w-64 h-64 mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dy='.3em' fill='%236b7280'%3EQR Not Available%3C/text%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="w-64 h-64 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">QR Code not available</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <p className="font-medium">#{bill?.bill_number}</p>
              <p className="text-gray-600">{bill?.customer_name}</p>
              <p className="text-lg font-bold text-green-600">₹{bill?.total_amount}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={downloadQRCode}
              disabled={!bill?.qr_code_path}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download QR
            </button>
            <button
              onClick={() => setShowQrModal(false)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                Scan this QR code with any smartphone camera to view the bill details
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Action Buttons (without Share button)
  const ActionButtons = () => (
    <div className="flex items-center gap-3">
      <button
        onClick={shareBill}
        className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
      >Share
      </button>
      
      {/* Download PDF Button */}
      <button
        onClick={downloadInvoice}
        disabled={generatingPDF}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
      >
        {generatingPDF ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download PDF
          </>
        )}
      </button>
      
      {/* Print Button */}
      <button
        onClick={printById}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
      >
        <Printer className="w-4 h-4" />
        Print
      </button>
    </div>
  );

  // Add QR Code in Invoice Footer (LEFT BOTTOM - 30x30)
  const InvoiceFooterWithQR = () => (
    <div className="bg-white">
      <div className="flex justify-between items-center">
        {/* QR Code in bottom left - 30x30 */}
        <div className="flex flex-col items-start">
          {bill?.qr_code_path && (
            <>
              <div className="mb-1">
                <img 
                  src={bill.qr_code_path}
                  alt="Bill QR Code" 
                  className="w-[100px] h-[100px] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowQrModal(true)}
                  title="Click to enlarge QR code"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'block';
                  }}
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-xs text-gray-500">Scan QR to verify</p>
            </>
          )}
        </div>
        
        {/* <div className="text-center text-gray-600 text-sm">
          <p>Thank you for your business!</p>
          <p className="mt-1">For any queries, contact {bill?.org_name}</p>
          <p className="mt-1">Bill generated on {new Date(bill?.created_at).toLocaleString('en-IN')}</p>
        </div> */}
      </div>
    </div>
  );

  // Print Styles
  const PrintStyles = () => (
    <style>{`
      @media print {
        #header, #summarycards, .no-print {
          display: none !important;
        }
        
        /* Show QR code in print */
        .qr-code-print {
          display: block !important;
          position: absolute;
          bottom: 20px;
          left: 20px;
          width: 30px !important;
          height: 30px !important;
          opacity: 1 !important;
        }
        
        .qr-text {
          display: block !important;
          position: absolute;
          bottom: 50px;
          left: 10px;
          font-size: 8px !important;
          color: #666;
          width: 50px;
          text-align: center;
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
          padding: 1mm;
          font-size: 11px;

          box-shadow: none !important;
          border: none !important;
        }
        #invoice .rounded-lg {
          border-radius: 0 !important;
        }
        @page {
          size: A4;
          margin: 2mm;
        }
      }
    `}</style>
  );

  // QR code for print
  const InvoiceQRForPrint = () => (
    <>
      {bill?.qr_code_path && (
        <>
          <div className="hidden print:block qr-code-print">
            <img 
              src={bill.qr_code_path} 
              alt="Bill QR Code" 
              className="w-[30px] h-[30px]"
              crossOrigin="anonymous"
            />
          </div>
          <div className="hidden print:block qr-text">Scan to verify</div>
        </>
      )}
    </>
  );

  const downloadInvoice = async () => {
    if (!bill) return;
    
    try {
      setGeneratingPDF(true);
      
      const tempElement = document.createElement('div');
      tempElement.style.position = 'fixed';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '0';
      tempElement.style.width = '800px';
      tempElement.style.padding = '20px';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.boxSizing = 'border-box';
      
      tempElement.innerHTML = generateInvoiceHTML(bill);
      document.body.appendChild(tempElement);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempElement.scrollHeight,
      });
      
      document.body.removeChild(tempElement);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const imgWidth = 190;
      const pageHeight = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Invoice_${bill.bill_number}_${new Date().getTime()}.pdf`, { compression: true });
      
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateInvoiceHTML = (bill) => {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${bill.bill_number}</title>
      <style>
        @page { margin: 0; }
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0; 
          padding: 5px; 
          background: white;
          font-size: 11px;
          line-height: 1.4;
          color: #333;
        }
        .container { max-width: 800px; margin: 0 auto; }
        
        /* Header */
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
        }
        .org-info h1 { 
          font-size: 20px; 
          margin: 0 0 5px 0; 
          color: #333; 
          font-weight: bold;
        }
        .invoice-title { 
          text-align: right; 
        }
        .invoice-title h2 { 
          font-size: 24px; 
          margin: 0 0 5px 0; 
          font-weight: bold; 
          color: #333;
        }
        
        /* QR Code in PDF */
        .qr-container {
          position: absolute;
          bottom: 20px;
          left: 20px;
          width: 60px;
          text-align: center;
        }
        .qr-container img {
          width: 50px;
          height: 50px;
        }
        .qr-text {
          font-size: 8px;
          color: #666;
          margin-top: 2px;
        }
        
        /* ... rest of your existing styles ... */
      </style>
    </head>
    <body>
      <div class="container">
        <!-- QR Code for PDF -->
        ${bill.qr_code_path ? `
          <div class="qr-container">
            <img src="${bill.qr_code_path}" alt="QR Code" />
            <div class="qr-text">Scan to verify</div>
          </div>
        ` : ''}
        
        <!-- Header -->
        <div class="header">
          <div class="org-info">
            ${bill.org_logo ? `<img src="${bill.org_logo}" alt="${bill.org_name}" style="height: 60px; margin-bottom: 10px;" />` : ''}
            <h1>${bill.org_name}</h1>
            <div class="org-details">
              <div>${bill.address}</div>
              ${bill.primary_phone ? `<div>Phone: ${bill.primary_phone}</div>` : ''}
              ${bill.gst_number ? `<div style="font-weight: bold; margin-top: 3px;">GSTIN: ${bill.gst_number}</div>` : ''}
            </div>
          </div>
          <div class="invoice-title">
            <h2>TAX INVOICE</h2>
            <div class="invoice-number">#${bill.bill_number}</div>
            <div style="font-size: 11px; color: #555; margin-top: 5px;">
              <div>Date: ${formatDate(bill.created_at)}</div>
              <div>Time: ${formatTime(bill.created_at)}</div>
            </div>
          </div>
        </div>
        
        <!-- ... rest of your invoice HTML ... -->
      </div>
    </body>
    </html>
    `;
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch(method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cheque': return <FileText className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Bill not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <ToastContainer />
      <PrintStyles />
      
      {/* Header */}
      <div id="header" className="mb-6 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard/billing-management')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bills
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                #{bill.bill_number}
              </span>
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
          
          <ActionButtons />
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
        <div id="invoice" className="bg-white rounded-lg shadow-lg border overflow-hidden mb-4">
          {/* Invoice Header */}
          <div className="p-4 border-b border-gray-200">
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
              {/* Footer with QR Code */}
          <InvoiceFooterWithQR />
              {/* Invoice Title */}
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">TAX INVOICE</h2>
                <div className="text-lg font-semibold text-gray-700">#{bill.bill_number}</div>
                <div className="text-sm text-gray-600 mt-2">
                  <div>Date: {new Date(bill.created_at).toLocaleDateString('en-IN')}</div>
                  <div>Time: {new Date(bill.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Billing Details */}
          <div className="p-2 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bill To */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3  border-b border-gray-300">BILL TO:</h3>
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-900">{bill.customer_name}</div>
                  {bill.customer_phone && <div className="text-gray-600">📞 {bill.customer_phone}</div>}
                  {bill.customer_email && <div className="text-gray-600">✉️ {bill.customer_email}</div>}
                  {bill.customer_address && (
                    <div className="text-gray-600 mt-1">{bill.customer_address}</div>
                  )}
                </div>
              </div>
              
              {/* Invoice Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3  border-b border-gray-300">INVOICE DETAILS:</h3>
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
          <div className="p-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">#</th>
                  <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">DESCRIPTION</th>
                  <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">SKU</th>
                  <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">UNIT PRICE</th>
                  <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">QUANTITY</th>
                  <th className="border border-gray-300 p-2 text-left font-semibold text-gray-700">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {bill.items?.map((item, index) => (
                  <tr key={item.bill_item_id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 p-2">
                      <div className="font-medium text-gray-900">{item.product_name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-2">{item.sku || 'N/A'}</td>
                    <td className="border border-gray-300 p-2">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 font-medium">
                      ₹{parseFloat(item.total_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="p-2 border-t border-gray-200 mr-4">
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
                  
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-lg font-bold">
                      <span>TOTAL AMOUNT</span>
                      <span >₹{parseFloat(bill.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {bill.paid_amount > 0 && (
                    <div className="flex justify-between ">
                      <span> PAID AMOUNT </span>
                      <span>₹{parseFloat(bill.paid_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bill.due_amount > 0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>BALANCE DUE</span>
                      <span>₹{parseFloat(bill.due_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {/* <div className="flex justify-between items-center">
                    <span >PAYMENT METHOD</span>
                    <span className="font-medium flex items-center gap-1">
                      {bill.payment_method.toUpperCase()}
                    </span>
                  </div> */}
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
                      <span> {bill.bank_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          
          
          {/* QR Code for Print */}
          <InvoiceQRForPrint />
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQrModal && <QRCodeModal />}
    </div>
  );
};

export default BillView;