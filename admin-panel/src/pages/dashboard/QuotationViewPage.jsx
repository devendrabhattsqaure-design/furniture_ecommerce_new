import React, { useEffect, useRef, useState } from 'react'
import html2pdf from "html2pdf.js";
import { Phone } from 'lucide-react';

const QuotationViewPage = ({quotationData}) => {
  const [quotation, setQuotation] = useState({});
  const [company, setCompany] = useState({});
     const printRef = useRef();
    

//Fetch Company

const fetchCompany = async()=>{
  const token = localStorage.getItem('token');
  let res = await fetch(`http://localhost:5000/api/organizations/${quotationData.org_id}`,{
     headers: {
          'Authorization': `Bearer ${token}`
        }
      }
  )
  let data = await res.json();
  console.log(data.organization)
  setCompany(data.organization)
}


  // ----- PRINT FUNCTION -----
  const handlePrint = () => {
    const printContent = document.getElementById("quotation").innerHTML;
  const originalContent = document.body.innerHTML;

  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;
  window.location.reload();
  };
  const handleDownloadClick = async () => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/quotation/download/${quotationData.quotation_id}`
    );
    const data = await res.json();
console.log(data)
  const fixed = {
  ...data.row,
  items: typeof data.row.items === "string" 
    ? JSON.parse(data.row.items) 
    : data.row.items
};
console.log(fixed)
  setQuotation(fixed);  // save full quotation
    // setTimeout(() => generatePDF(data.row), 800);  // generate pdf after data loads
  } catch (err) {
    console.log(err);
  }
};
useEffect(()=>{
handleDownloadClick()
fetchCompany()
},[quotationData])

  // ----- PDF DOWNLOAD FUNCTION -----
  const handleDownloadPDF = () => {
    const element = printRef.current;

    const opt = {
      margin: 0.5,
      filename: `Quotation_${quotation.quotation_id}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div  className="w-full p-4">
      {/* BUTTONS */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Print
        </button>

        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Download PDF
        </button>
      </div>

      {/* CONTENT TO PRINT */}
      <div id='quotation' ref={printRef} className="bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-3">

  {/* LEFT SIDE — LOGO */}
  <div className="flex items-center">
    <img
      src={company.org_logo}     // change to your logo path
      alt="Company Logo"
      className="w-20 h-20 object-contain"
    />
  </div>

  {/* RIGHT SIDE — COMPANY DETAILS */}
  <div className="text-right">
    <h1 className="text-xl font-bold">{company.org_name}</h1>
    <p className="text-sm text-gray-700"> {company.primary_phone}</p>
    <p className="text-sm text-gray-700">{company.address}</p>
  </div>

</div>
        <h2 className="text-2xl font-bold text-center mb-4">
          Quotation Report
        </h2>

        {/* QUOTATION HEADER INFO */}
        <div className="mb-4">
          <p><strong>Quotation ID:</strong> {quotation.quotation_id}</p>
          <p><strong>Customer Name:</strong> {quotation.customer_name}</p>
          <p><strong>Date:</strong> {new Date(quotation.quotation_date).toLocaleDateString()}</p>
        </div>

        <hr />

        {/* ITEMS TABLE */}
        <h3 className="text-xl font-semibold mt-4">Items</h3>

        <table className="w-full border mt-3">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Item</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.product_name}</td>
                <td className="border p-2 text-center">{item.quantity}</td>
                <td className="border p-2">₹ {item.price}</td>
                <td className="border p-2">₹ {item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTAL */}
       <div className="flex justify-end mt-6">
  <div className="w-full max-w-xs text-right border-t pt-4 space-y-2">
    <div className="flex justify-between text-sm font-medium">
      <span>Sub Total:</span>
      <span>₹ {quotation.sub_total}</span>
    </div>

    <div className="flex justify-between text-sm font-medium">
      <span>Discount:</span>
      <span>₹ {quotation.discount_amount}</span>
    </div>

    <div className="flex justify-between text-sm font-medium">
      <span>Shipping Charges:</span>
      <span>₹ {quotation.shipping_charges}</span>
    </div>

    <div className="flex justify-between text-sm font-medium">
      <span>Tax (GST):</span>
      <span>₹ {quotation.gst_amount}</span>
    </div>

    <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold">
      <span>Grand Total:</span>
      <span>₹ {quotation.grand_total}</span>
    </div>
  </div>
</div>

      </div>
    </div>
  );
}

export default QuotationViewPage
