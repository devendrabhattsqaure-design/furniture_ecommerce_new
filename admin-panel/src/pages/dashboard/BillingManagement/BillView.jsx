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
  const printById = () => {
  window.print();
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
      tempElement.style.padding = '20px';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.boxSizing = 'border-box';
      
      // Generate invoice HTML
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
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll('img');
          images.forEach(img => {
            if (!img.complete) {
              img.onload = () => {};
            }
          });
        }
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

  // Amount in words function for PDF
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
          padding: 20px; 
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
        .org-details { 
          font-size: 11px; 
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
          font-size: 16px; 
          font-weight: bold; 
          color: #666; 
        }
        
        /* Details */
        .details-grid { 
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 30px;
        }
        .section { }
        .section h3 { 
          font-size: 14px; 
          font-weight: bold; 
          margin: 0 0 10px 0; 
          color: #333; 
          border-bottom: 1px solid #ddd; 
          padding-bottom: 5px;
        }
        
        /* Table */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 11px;
        }
        th {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
        }
        td {
          border: 1px solid #ddd;
          padding: 12px 8px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Totals */
        .totals {
          width: 300px;
          margin-left: auto;
          margin-bottom: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .grand-total {
          display: flex;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 2px solid #333;
          margin-top: 12px;
          font-size: 16px;
          font-weight: bold;
        }
        
        /* Amount in Words */
        .amount-words-box {
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f7ff;
          border: 1px solid #cce5ff;
          border-radius: 4px;
          font-size: 12px;
          line-height: 1.5;
        }
        .amount-words-label {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        
        /* Payment Details */
        .payment-details-box {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-top: 20px;
        }
        .payment-header {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #dee2e6;
        }
        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .payment-label {
          color: #555;
        }
        .payment-value {
          font-weight: 500;
          color: #333;
        }
        
        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #777;
        }
        .thank-you {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }
        
        /* Status */
        .status-paid { color: #10b981; font-weight: bold; }
        .status-partial { color: #f59e0b; font-weight: bold; }
        .status-pending { color: #ef4444; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
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

        <!-- Details -->
        <div class="details-grid">
          <div class="section">
            <h3>BILL TO:</h3>
            <div style="line-height: 1.5;">
              <div style="font-weight: bold; font-size: 13px;">${bill.customer_name}</div>
              ${bill.customer_phone ? `<div>📞 ${bill.customer_phone}</div>` : ''}
              ${bill.customer_email ? `<div>✉️ ${bill.customer_email}</div>` : ''}
              ${bill.customer_address ? `<div style="color: #666; margin-top: 5px;">${bill.customer_address}</div>` : ''}
            </div>
          </div>
          
          <div class="section">
            <h3>INVOICE DETAILS:</h3>
            <div style="line-height: 1.5;">
              <div><strong>Bill No:</strong> ${bill.bill_number}</div>
              <div><strong>Payment Method:</strong> ${bill.payment_method.toUpperCase()}</div>
              <div><strong>Issued By:</strong> ${bill.created_by_name || 'System'}</div>
              ${bill.due_date ? `<div><strong>Due Date:</strong> ${formatDate(bill.due_date)}</div>` : ''}
              <div><strong>Status:</strong> 
                <span class="status-${bill.payment_status}">
                  ${bill.payment_status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 40%">DESCRIPTION</th>
              <th style="width: 15%">SKU</th>
              <th style="width: 10%">UNIT PRICE</th>
              <th style="width: 10%">QUANTITY</th>
              <th style="width: 15%">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items ? bill.items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>
                  <div style="font-weight: bold;">${item.product_name}</div>
                  ${item.description ? `<div style="font-size: 10px; color: #666; margin-top: 2px;">${item.description}</div>` : ''}
                </td>
                <td>${item.sku || 'N/A'}</td>
                <td class="text-right">₹${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                <td class="text-center">${item.quantity || 0}</td>
                <td class="text-right" style="font-weight: bold;">₹${parseFloat(item.total_price || 0).toFixed(2)}</td>
              </tr>
            `).join('') : ''}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>SUBTOTAL:</span>
            <span>₹${parseFloat(bill.subtotal || 0).toFixed(2)}</span>
          </div>
          
          ${bill.discount_amount > 0 ? `
            <div class="total-row" style="color: #e74c3c;">
              <span>DISCOUNT:</span>
              <span>-₹${parseFloat(bill.discount_amount || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          
          ${bill.tax_amount > 0 ? `
            <div class="total-row">
              <span>GST (${bill.gst_percentage || 0}%):</span>
              <span>+₹${parseFloat(bill.tax_amount || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          
          ${bill.shipment_charges > 0 ? `
            <div class="total-row">
              <span>SHIPMENT CHARGES:</span>
              <span>+₹${parseFloat(bill.shipment_charges || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          
          <div class="grand-total">
            <span>TOTAL AMOUNT:</span>
            <span>₹${parseFloat(bill.total_amount || 0).toFixed(2)}</span>
          </div>
          
          ${bill.paid_amount > 0 ? `
            <div class="total-row" style="color: #27ae60;">
              <span>AMOUNT PAID:</span>
              <span>-₹${parseFloat(bill.paid_amount || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          
          ${bill.due_amount > 0 ? `
            <div class="total-row" style="color: #e74c3c; font-weight: bold;">
              <span>BALANCE DUE:</span>
              <span>₹${parseFloat(bill.due_amount || 0).toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="payment-row">
            <span class="payment-label">Payment Method:</span>
            <span class="payment-value">${bill.payment_method.toUpperCase()}</span>
          </div>
          <!-- Cheque Number -->
          ${bill.payment_method === 'cheque' && bill.cheque_number ? `
            <div class="payment-row">
              <span class="payment-label">Cheque Number:</span>
              <span class="payment-value">${bill.cheque_number}</span>
            </div>
          ` : ''}
          
          <!-- Transaction ID -->
          ${bill.transaction_id ? `
            <div class="payment-row">
              <span class="payment-label">Transaction ID:</span>
              <span class="payment-value">${bill.transaction_id}</span>
            </div>
          ` : ''}
          
          <!-- Bank Name -->
          ${bill.bank_name ? `
            <div class="payment-row">
              <span class="payment-label">Bank:</span>
              <span class="payment-value">${bill.bank_name}</span>
            </div>
          ` : ''}
          
          <!-- Card Last 4 -->
          ${bill.card_last4 ? `
            <div class="payment-row">
              <span class="payment-label">Card Number:</span>
              <span class="payment-value">**** **** **** ${bill.card_last4}</span>
            </div>
          ` : ''}
          
          <!-- UPI ID -->
          ${bill.upi_id ? `
            <div class="payment-row">
              <span class="payment-label">UPI ID:</span>
              <span class="payment-value">${bill.upi_id}</span>
            </div>
          ` : ''}
          
          <!-- Account Number -->
          ${bill.account_number ? `
            <div class="payment-row">
              <span class="payment-label">Account Number:</span>
              <span class="payment-value">${bill.account_number}</span>
            </div>
          ` : ''}
        </div>

       
        
      </div>
    </body>
    </html>
  `;
};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(err => {
      toast.error('Failed to copy');
    });
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch(method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cheque': return <FileText className="w-4 h-4" />;
      case 'online': return <CreditCard className="w-4 h-4" />;
      case 'upi': return <CreditCard className="w-4 h-4" />;
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
      <style>{`
        @media print {
          #header {
            display: none !important;
          }
          #summarycards {
            display: none !important;
          }
          #pdffooter {
            display: none !important;
          }
          .no-print {
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
      width: 210mm;       /* A4 width */
      padding: 10mm 8mm;  /* Less padding for compact print */
      box-shadow: none !important;
      border: none !important;
    }

    /* Force BILL TO and INVOICE DETAILS in one row */
    #invoice .billing-row {
      display: flex !important;
      flex-direction: row !important;
      justify-content: space-between;
      gap: 20px;
      width: 100%;
    }

    #invoice .billing-col {
      flex: 1;
    }

    /* Smaller fonts for PDF compact fit */
    #invoice {
      font-size: 12px !important;
    }
    #invoice h1, #invoice h2, #invoice h3 {
      margin: 0;
      padding: 0;
    }

    /* Table compacting */
    #invoice table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px !important;
    }

    #invoice th,
    #invoice td {
      border: 1px solid #ccc !important;
      padding: 4px 6px !important;
    }

    #invoice th {
      background: #f2f2f2 !important;
      font-weight: bold;
    }

    /* Remove rounding */
    #invoice .rounded-lg {
      border-radius: 0 !important;
    }

    /* Ensure everything fits in ONE PAGE */
    @page {
      size: A5;
      margin: 1mm;
    }
        }
      `}</style>
      
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
            <button
              onClick={() => printById()}
              disabled={generatingPDF}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
              {generatingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Printing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Print Invoice
                </>
              )}
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
                  <tr key={item.bill_item_id} className="hover:bg-gray-50">
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
                  
                  <div className="pt-4 border-t border-gray-300">
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
                  <div className="flex justify-between items-center">
                    <span >PAYMENT METHOD</span>
                    <span className="font-medium flex items-center gap-1">
                      
                      {bill.payment_method.toUpperCase()}
                    </span>
                  </div>
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
            </div>
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