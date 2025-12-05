import React from "react";

const InvoiceTemplate = ({ bill }) => {
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

  return (
    <div style={{
      fontFamily: "'Arial', sans-serif",
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      background: 'white',
      fontSize: '12px',
      lineHeight: '1.4',
      color: '#333'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #333'
      }}>
        {/* Organization Info */}
        <div style={{ flex: 1 }}>
          {bill.org_logo && (
            <img 
              src={bill.org_logo} 
              alt={bill.org_name}
              style={{ height: '60px', marginBottom: '10px' }}
            />
          )}
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#333' }}>
            {bill.org_name}
          </h1>
          <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.4' }}>
            <div>{bill.address}</div>
            <div>Phone: {bill.primary_phone || 'N/A'}</div>
            {bill.secondary_phone && <div>Alt: {bill.secondary_phone}</div>}
            {bill.gst_number && (
              <div style={{ fontWeight: 'bold', marginTop: '3px' }}>GSTIN: {bill.gst_number}</div>
            )}
          </div>
        </div>
        
        {/* Invoice Title */}
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#333' }}>
            TAX INVOICE
          </h2>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>#{bill.bill_number}</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '5px' }}>
            <div>Date: {formatDate(bill.created_at)}</div>
            <div>Time: {formatTime(bill.created_at)}</div>
          </div>
        </div>
      </div>

      {/* Billing Details */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        fontSize: '12px'
      }}>
        {/* Bill To */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: '#333',
            borderBottom: '1px solid #ddd',
            paddingBottom: '3px'
          }}>
            BILL TO:
          </h3>
          <div style={{ lineHeight: '1.5' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{bill.customer_name}</div>
            {bill.customer_phone && <div style={{ marginTop: '2px' }}>📞 {bill.customer_phone}</div>}
            {bill.customer_email && <div style={{ marginTop: '2px' }}>✉️ {bill.customer_email}</div>}
            {bill.customer_address && (
              <div style={{ marginTop: '2px', color: '#666' }}>{bill.customer_address}</div>
            )}
          </div>
        </div>
        
        {/* Invoice Details */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: '#333',
            borderBottom: '1px solid #ddd',
            paddingBottom: '3px'
          }}>
            INVOICE DETAILS:
          </h3>
          <div style={{ lineHeight: '1.5' }}>
            <div><strong>Bill No:</strong> {bill.bill_number}</div>
            <div><strong>Payment Method:</strong> {bill.payment_method.toUpperCase()}</div>
            <div><strong>Issued By:</strong> {bill.created_by_name || 'System'}</div>
            {bill.payment_status === 'partial' && (
              <div style={{ marginTop: '5px' }}>
                <div><strong>Payment Status:</strong> <span style={{ color: '#e67e22' }}>PARTIAL</span></div>
                <div><strong>Amount Paid:</strong> ₹{parseFloat(bill.paid_amount || 0).toFixed(2)}</div>
                <div><strong>Due Amount:</strong> ₹{parseFloat(bill.due_amount || 0).toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
        fontSize: '11px'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'left', fontWeight: 'bold', width: '5%' }}>
              Sr.
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'left', fontWeight: 'bold', width: '40%' }}>
              Product Description
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'left', fontWeight: 'bold', width: '15%' }}>
              SKU
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'right', fontWeight: 'bold', width: '10%' }}>
              Price (₹)
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'center', fontWeight: 'bold', width: '10%' }}>
              Qty
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'right', fontWeight: 'bold', width: '15%' }}>
              Amount (₹)
            </th>
          </tr>
        </thead>
        <tbody>
          {bill.items && bill.items.map((item, index) => (
            <tr key={item.bill_item_id}>
              <td style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'center' }}>
                {index + 1}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px 5px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{item.product_name}</div>
                {item.description && (
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                    {item.description}
                  </div>
                )}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px 5px' }}>
                {item.sku || 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'right' }}>
                {parseFloat(item.unit_price || 0).toFixed(2)}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'center' }}>
                {item.quantity || 0}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px 5px', textAlign: 'right', fontWeight: 'bold' }}>
                {parseFloat(item.total_price || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '250px' }}>
          {/* Subtotal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
            <span>Subtotal:</span>
            <span>₹{parseFloat(bill.subtotal || 0).toFixed(2)}</span>
          </div>
          
          {/* Discount */}
          {bill.discount_amount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px', color: '#e74c3c' }}>
              <span>Discount:</span>
              <span>-₹{parseFloat(bill.discount_amount || 0).toFixed(2)}</span>
            </div>
          )}
          
          {/* Tax */}
          {bill.tax_amount > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                <span>Tax ({bill.gst_percentage || 0}%):</span>
                <span>+₹{parseFloat(bill.tax_amount || 0).toFixed(2)}</span>
              </div>
              {bill.gst_type && (
                <div style={{ fontSize: '10px', color: '#666', textAlign: 'right', marginBottom: '5px' }}>
                  GST Type: {bill.gst_type}
                </div>
              )}
            </>
          )}
          
          {/* Grand Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '8px',
            borderTop: '2px solid #333',
            marginTop: '8px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            <span>GRAND TOTAL:</span>
            <span>₹{parseFloat(bill.total_amount || 0).toFixed(2)}</span>
          </div>
          
          {/* Payment Status */}
          {bill.payment_status !== 'paid' && (
            <div style={{
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '11px'
            }}>
              <div><strong>Payment Status:</strong> {bill.payment_status.toUpperCase()}</div>
              <div><strong>Amount Paid:</strong> ₹{parseFloat(bill.paid_amount || 0).toFixed(2)}</div>
              <div><strong>Amount Due:</strong> ₹{parseFloat(bill.due_amount || 0).toFixed(2)}</div>
              {bill.due_date && (
                <div><strong>Due Date:</strong> {formatDate(bill.due_date)}</div>
              )}
            </div>
          )}
          
          {/* Amount in Words */}
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '11px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Amount in Words:</div>
            <div style={{ color: '#555' }}>{amountInWords(bill.total_amount || 0)}</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {bill.notes && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderLeft: '3px solid #3498db',
          fontSize: '11px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Notes:</div>
          <div>{bill.notes}</div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: '30px',
        paddingTop: '15px',
        borderTop: '1px solid #ddd',
        fontSize: '10px',
        color: '#777'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Declaration</div>
            <div>This is a computer-generated invoice and does not require a physical signature.</div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              For {bill.org_name || 'Organization'}
            </div>
            <div style={{ marginTop: '40px' }}>
              <div>Authorized Signatory</div>
              <div style={{
                borderTop: '1px solid #333',
                width: '150px',
                marginLeft: 'auto',
                marginTop: '5px'
              }}></div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div>Thank you for your business!</div>
          <div style={{ marginTop: '5px' }}>
            Invoice generated on {formatDate(new Date())} at {formatTime(new Date())}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;