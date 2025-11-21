import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import '../styles/Add_new_bill.css';

export default function AddBillForm() {
  const [formData, setFormData] = useState({
    patientName: '',
    billDate: '',
    totalAmount: '',
    paymentStatus: 'Unpaid',
    description: ''
  });

  const handleSave = () => {
    console.log('Bill submitted:', formData);
    alert('Bill saved successfully!');
  };

  const handleCancel = () => {
    setFormData({
      patientName: '',
      billDate: '',
      totalAmount: '',
      paymentStatus: 'Unpaid',
      description: ''
    });
  };

  return (
    <div className="bill-form-container">
      <div className="bill-form-card">
        <h1 className="form-title">Add New Bill</h1>
        
        <div>
          <div className="form-row">
            {/* Bill Date */}
            <div className="form-group">
              <label className="form-label">
                Bill Date
              </label>
              <div className="input-wrapper">
                <input
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => setFormData({...formData, billDate: e.target.value})}
                  className="form-input"
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            {/* Total Amount */}
            <div className="form-group">
              <label className="form-label">
                Amount
              </label>
              <div className="amount-input-wrapper">
              
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                  className="form-input amount-input"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Status */}
            <div className="form-group">
              <label className="form-label">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                className="form-select"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="description-group">
            <label className="form-label">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="5"
              className="form-textarea"
              placeholder="Enter a brief description for the bill..."
            />
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              onClick={handleCancel}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-save"
            >
              Save Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}