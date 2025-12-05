import React, { useState } from "react";
import { X, DollarSign, Loader2 } from "lucide-react";
import { toast } from 'react-toastify';

const PaymentModal = ({ bill, onClose, onSuccess }) => {
  const [paymentAmount, setPaymentAmount] = useState(bill.due_amount || '');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:5000/api";

  const getOrgId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.org_id || null;
    } catch (e) {
      return null;
    }
  };

  const handlePaymentUpdate = async () => {
    if (!bill) return;
    
    const payment = parseFloat(paymentAmount);
    if (!payment || isNaN(payment) || payment <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const currentPaid = parseFloat(bill.paid_amount || 0);
    const currentDue = parseFloat(bill.due_amount || 0);
    const totalAmount = parseFloat(bill.total_amount || 0);
    
    const newPaidAmount = Math.min(currentPaid + payment, totalAmount);
    const newDueAmount = Math.max(0, totalAmount - newPaidAmount);
    
    if (payment > currentDue) {
      toast.error(`Maximum payment amount is ₹${currentDue.toLocaleString('en-IN')}`);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bills/${bill.bill_id}/payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-org-id': getOrgId()
        },
        body: JSON.stringify({ 
          paid_amount: newPaidAmount,
          payment_amount: payment
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Payment of ₹${payment.toLocaleString('en-IN')} recorded successfully!`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Update Payment
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Bill: <span className="font-semibold">{bill.bill_number}</span></p>
            <p className="text-gray-600 mb-4">Customer: <span className="font-semibold">{bill.customer_name}</span></p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-lg font-bold">₹{parseFloat(bill.total_amount).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Due Amount</p>
                <p className="text-lg font-bold text-red-600">₹{parseFloat(bill.due_amount).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              placeholder="Enter payment amount"
              max={bill.due_amount}
              step="0.01"
              min="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: ₹{parseFloat(bill.due_amount).toLocaleString('en-IN')}
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentUpdate}
              disabled={loading || !paymentAmount || parseFloat(paymentAmount) <= 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Update Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;