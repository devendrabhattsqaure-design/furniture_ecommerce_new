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
    
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import InvoiceTemplate from "./components/InvoiceTemplate";

const BillView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

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
        } else {
          toast.error(data.message);
          navigate('/bills');
        }
      } else {
        toast.error("Failed to fetch bill details");
        navigate('/bills');
      }
    } catch (error) {
      console.error('Error fetching bill details:', error);
      toast.error("Error loading bill details");
      navigate('/bills');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    if (!bill) return;
    
    try {
      setGeneratingPDF(true);
      
      // Create a temporary div for PDF generation
      const tempElement = document.createElement('div');
      tempElement.style.position = 'fixed';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '0';
      tempElement.style.width = '800px';
      tempElement.style.padding = '40px';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.boxSizing = 'border-box';
      
      // Generate compact invoice HTML
      tempElement.innerHTML = generateCompactInvoiceHTML(bill);
      document.body.appendChild(tempElement);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempElement.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure all images are loaded
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            if (!img.complete) {
              img.onload = () => {};
            }
          });
        }
      });
      
      // Remove temporary element
      document.body.removeChild(tempElement);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const imgWidth = 190; // A4 width minus margins
      const pageHeight = 280; // A4 height minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Handle multi-page PDF
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
      
      // Save the PDF with small file size
      pdf.save(`Invoice_${bill.bill_number}_${new Date().getTime()}.pdf`, { compression: true });
      
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const generateCompactInvoiceHTML = (bill) => {
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
            padding: 40px; 
            background: white;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
          }
          .container { max-width: 800px; margin: 0 auto; }
          
          /* Header */
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #333;
          }
          .org-info h1 { 
            font-size: 20px; 
            margin: 0 0 5px 0; 
            color: #333; 
          }
          .org-details { 
            font-size: 10px; 
            color: #555; 
            line-height: 1.4;
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
          .invoice-number { 
            font-size: 12px; 
            font-weight: bold; 
            color: #666; 
          }
          
          /* Details */
          .details { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 20px; 
            font-size: 11px;
          }
          .section { flex: 1; }
          .section h3 { 
            font-size: 12px; 
            font-weight: bold; 
            margin: 0 0 8px 0; 
            color: #333; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 3px;
          }
          .bill-to { padding-right: 20px; }
          
          /* Table */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
          }
          th {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            padding: 8px 5px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #ddd;
            padding: 8px 5px;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          /* Totals */
          .totals {
            width: 250px;
            margin-left: auto;
            margin-bottom: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 11px;
          }
          .grand-total {
            display: flex;
            justify-content: space-between;
            padding-top: 8px;
            border-top: 2px solid #333;
            margin-top: 8px;
            font-size: 12px;
            font-weight: bold;
          }
          
          /* Footer */
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 9px;
            color: #777;
          }
          .declaration {
            margin-bottom: 10px;
          }
          .signature {
            text-align: right;
            margin-top: 40px;
          }
          .thank-you {
            text-align: center;
            margin-top: 20px;
          }
          
          /* Status Badges */
          .status-paid { color: #10b981; font-weight: bold; }
          .status-partial { color: #f59e0b; font-weight: bold; }
          .status-pending { color: #ef4444; font-weight: bold; }
          
          /* Compact layout */
          .compact-info { font-size: 9px; color: #666; }
          .amount-words {
            margin-top: 15px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${generateInvoiceContent(bill, formatDate, formatTime)}
        </div>
      </body>
      </html>
    `;
  };

  const generateInvoiceContent = (bill, formatDate, formatTime) => {
    return `
      <!-- Header -->
      <div class="header">
        <div class="org-info">
          ${bill.org_logo ? `
            <img src="${bill.org_logo}" alt="${bill.org_name}" style="height: 50px; margin-bottom: 10px;" />
          ` : ''}
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
          <div class="compact-info">
            <div>Date: ${formatDate(bill.created_at)}</div>
            <div>Time: ${formatTime(bill.created_at)}</div>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="details">
        <div class="section bill-to">
          <h3>BILL TO:</h3>
          <div style="line-height: 1.5;">
            <div style="font-weight: bold; font-size: 13px;">${bill.customer_name}</div>
            ${bill.customer_phone ? `<div>📞 ${bill.customer_phone}</div>` : ''}
            ${bill.customer_email ? `<div>✉️ ${bill.customer_email}</div>` : ''}
            ${bill.customer_address ? `<div style="color: #666;">${bill.customer_address}</div>` : ''}
          </div>
        </div>
        
        <div class="section">
          <h3>INVOICE DETAILS:</h3>
          <div style="line-height: 1.5;">
            <div><strong>Bill No:</strong> ${bill.bill_number}</div>
            <div><strong>Payment Method:</strong> ${bill.payment_method.toUpperCase()}</div>
            <div><strong>Issued By:</strong> ${bill.created_by_name || 'System'}</div>
            ${bill.due_date ? `<div><strong>Due Date:</strong> ${formatDate(bill.due_date)}</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th style="width: 5%">Sr.</th>
            <th style="width: 45%">Product Description</th>
            <th style="width: 15%">SKU</th>
            <th style="width: 10%">Price (₹)</th>
            <th style="width: 10%">Qty</th>
            <th style="width: 15%">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${bill.items ? bill.items.map((item, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td>
                <div style="font-weight: bold;">${item.product_name}</div>
                ${item.description ? `<div style="font-size: 9px; color: #666;">${item.description}</div>` : ''}
              </td>
              <td>${item.sku || 'N/A'}</td>
              <td class="text-right">${parseFloat(item.unit_price || 0).toFixed(2)}</td>
              <td class="text-center">${item.quantity || 0}</td>
              <td class="text-right" style="font-weight: bold;">${parseFloat(item.total_price || 0).toFixed(2)}</td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>₹${parseFloat(bill.subtotal || 0).toFixed(2)}</span>
        </div>
        
        ${bill.discount_amount > 0 ? `
          <div class="total-row" style="color: #e74c3c;">
            <span>Discount:</span>
            <span>-₹${parseFloat(bill.discount_amount || 0).toFixed(2)}</span>
          </div>
        ` : ''}
        
        ${bill.tax_amount > 0 ? `
          <div class="total-row">
            <span>Tax (${bill.gst_percentage || 0}%):</span>
            <span>+₹${parseFloat(bill.tax_amount || 0).toFixed(2)}</span>
          </div>
        ` : ''}
        
        <div class="grand-total">
          <span>GRAND TOTAL:</span>
          <span>₹${parseFloat(bill.total_amount || 0).toFixed(2)}</span>
        </div>
        
        ${bill.paid_amount > 0 ? `
          <div class="total-row">
            <span>Amount Paid:</span>
            <span>-₹${parseFloat(bill.paid_amount || 0).toFixed(2)}</span>
          </div>
        ` : ''}
        
        ${bill.due_amount > 0 ? `
          <div class="total-row" style="color: #ef4444; font-weight: bold;">
            <span>Balance Due:</span>
            <span>₹${parseFloat(bill.due_amount || 0).toFixed(2)}</span>
          </div>
        ` : ''}
        
        <!-- Payment Status -->
        <div style="margin-top: 10px; padding: 8px; background-color: #f8f9fa; border-radius: 4px; font-size: 10px;">
          <div><strong>Payment Status:</strong> 
            <span class="status-${bill.payment_status}">
              ${bill.payment_status.toUpperCase()}
            </span>
          </div>
        </div>
        
        <!-- Amount in Words -->
        <div class="amount-words">
          <div style="font-weight: bold; margin-bottom: 3px;">Amount in Words:</div>
          <div>${amountInWords(bill.total_amount || 0)}</div>
        </div>
      </div>

      ${bill.notes ? `
        <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-left: 3px solid #3498db; font-size: 10px;">
          <div style="font-weight: bold; margin-bottom: 3px;">Notes:</div>
          <div>${bill.notes}</div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div class="footer">
        <div class="declaration">
          <strong>Declaration:</strong> This is a computer-generated invoice and does not require a physical signature.
        </div>
        <div class="signature">
          <div style="font-weight: bold;">For ${bill.org_name}</div>
          <div style="margin-top: 30px;">
            <div>Authorized Signatory</div>
            <div style="border-top: 1px solid #333; width: 150px; margin-left: auto;"></div>
          </div>
        </div>
        <div class="thank-you">
          <div>Thank you for your business!</div>
          <div style="margin-top: 5px;">
            Invoice generated on ${formatDate(new Date())} at ${formatTime(new Date())}
          </div>
        </div>
      </div>
    `;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(err => {
      toast.error('Failed to copy');
    });
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
    <div className="min-h-screen bg-gray-50 py-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="mb-6 px-4 max-w-6xl mx-auto">
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
          
          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>

      {/* Bill Details */}
      <div className="px-4 max-w-6xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Bill Info */}
          <div className="space-y-6">
            {/* Customer Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-gray-900">{bill.customer_name}</p>
                    <button
                      onClick={() => copyToClipboard(bill.customer_name)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {bill.customer_phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone
                      </label>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900">{bill.customer_phone}</p>
                        <button
                          onClick={() => copyToClipboard(bill.customer_phone)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {bill.customer_email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900">{bill.customer_email}</p>
                        <button
                          onClick={() => copyToClipboard(bill.customer_email)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {bill.customer_address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Address
                    </label>
                    <p className="text-gray-700 whitespace-pre-line">{bill.customer_address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bill Details Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileDigit className="w-5 h-5" />
                Bill Details
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bill Number</span>
                  <span className="font-medium">{bill.bill_number}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium">
                    {new Date(bill.created_at).toLocaleDateString()} {new Date(bill.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">{bill.payment_method.toUpperCase()}</span>
                </div>
                
                {bill.due_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </span>
                    <span className="font-medium">
                      {new Date(bill.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {/* In the Bill Details Card */}
{bill.gst_type && (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">GST Type</span>
    <span className="font-medium">
      {bill.gst_type === 'with_gst' ? 'With GST' : 'Without GST'}
    </span>
  </div>
)}

{bill.shipment_charges > 0 && (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 flex items-center gap-1">
      <Truck className="w-4 h-4" />
      Shipment Charges
    </span>
    <span className="font-medium">
      ₹{parseFloat(bill.shipment_charges).toLocaleString('en-IN')}
    </span>
  </div>
)}

{bill.transaction_id && (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">Transaction ID</span>
    <span className="font-medium">{bill.transaction_id}</span>
  </div>
)}

{bill.cheque_number && (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">Cheque Number</span>
    <span className="font-medium">{bill.cheque_number}</span>
  </div>
)}

{bill.bank_name && (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">Bank Name</span>
    <span className="font-medium">{bill.bank_name}</span>
  </div>
)}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Issued By</span>
                  <span className="font-medium">{bill.created_by_name || 'System'}</span>
                </div>
                
                {bill.notes && (
                  <div className="pt-3 border-t">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Notes</label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{bill.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Items & Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Items ({bill.items?.length || 0})</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bill.items?.map((item, index) => (
                      <tr key={item.bill_item_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.product_name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500">{item.sku}</td>
                        <td className="px-6 py-4 text-gray-900">
                          ₹{parseFloat(item.unit_price).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          ₹{parseFloat(item.total_price).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Bill Summary</h2>
              
              <div className="space-y-3 max-w-md ml-auto">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{parseFloat(bill.subtotal).toLocaleString('en-IN')}</span>
                </div>
                
                {bill.discount_amount > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{parseFloat(bill.discount_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                {bill.tax_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Tax ({bill.gst_percentage || 0}%)</span>
                    <span className="font-medium">+₹{parseFloat(bill.tax_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t text-lg font-bold">
                  <span>Grand Total</span>
                  <span className="text-green-600">₹{parseFloat(bill.total_amount).toLocaleString('en-IN')}</span>
                </div>
                
                {bill.paid_amount > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-medium text-green-600">₹{parseFloat(bill.paid_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                {bill.due_amount > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-600">Balance Due</span>
                    <span className="font-medium text-red-600">₹{parseFloat(bill.due_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                {/* Amount in Words */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Amount in Words</p>
                  <p className="text-gray-600">{amountInWords(bill.total_amount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden div for PDF generation */}
      <div id="pdf-content" className="hidden">
        <InvoiceTemplate bill={bill} />
      </div>
    </div>
  );
};

// Helper function to convert amount to words
const amountInWords = (num) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  const b = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  const convertToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertToWords(n % 100) : '');
    if (n < 100000) return convertToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convertToWords(n % 1000) : '');
    if (n < 10000000) return convertToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convertToWords(n % 100000) : '');
    return convertToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convertToWords(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let words = convertToWords(rupees) + ' Rupees';
  if (paise > 0) {
    words += ' and ' + convertToWords(paise) + ' Paise';
  }
  
  return words + ' Only';
};

export default BillView;