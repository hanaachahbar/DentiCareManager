// src/components/AddBill.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Add_new_bill.css';

const AddBill = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const appointment = location.state?.appointment || null;

  const [billNumber, setBillNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!amount || !billNumber) {
      alert('Please fill bill number and amount.');
      return;
    }

    const billData = {
      billNumber: billNumber.trim(),
      amount: parseFloat(amount),
      status,
      dueDate: dueDate || null,
      notes: notes.trim(),
      appointmentId: appointment?.id || null,
    };

    console.log('Bill data:', billData);
    alert('Bill saved (frontend only). You can now connect this to your backend.');
    navigate(-1);
  };

  return (
    <div className="bill-page-container">
      <div className="bill-page-wrapper">
        <div className="bill-card">
          {/* Header like other pages */}
          <div className="bill-header">
            <button className="bill-back-btn" onClick={handleCancel}>
              ←
            </button>
            <div>
              <h1 className="bill-title">New bill</h1>
              <p className="bill-subtitle">
                {appointment
                  ? `For appointment on ${appointment.dateLabel || ''} at ${
                      appointment.time || ''
                    }`
                  : 'Create a bill for a service or appointment.'}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="bill-body">
            <form onSubmit={handleSave} className="bill-layout">
              {/* Bill details */}
              <section className="bill-section">
                <div className="bill-section-header">
                  <div className="bill-icon-circle">
                    <span className="bill-icon">#</span>
                  </div>
                  <div>
                    <h2 className="section-title">Bill details</h2>
                    <p className="section-hint">
                      Give this bill a reference number you can find later.
                    </p>
                  </div>
                </div>

                <div className="section-content bill-grid-2">
                  <div>
                    <label className="field-label">Bill number *</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="e.g., INV-2025-001"
                      value={billNumber}
                      onChange={(e) => setBillNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="field-label">Due date (optional)</label>
                    <input
                      type="date"
                      className="field-input"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Payment & status */}
              <section className="bill-section">
                <div className="bill-section-header">
                  <div className="bill-icon-circle">
                    <span className="bill-icon">$</span>
                  </div>
                  <div>
                    <h2 className="section-title">Payment</h2>
                    <p className="section-hint">
                      Set the total amount and mark the bill status.
                    </p>
                  </div>
                </div>

                <div className="section-content bill-grid-2">
                  <div>
                    <label className="field-label">Total amount *</label>
                    <div className="amount-wrapper">
                      <span className="amount-prefix">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="field-input amount-input"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Status</label>
                    <select
                      className="field-input"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Notes */}
              <section className="bill-section">
                <div className="bill-section-header">
                  <div className="bill-icon-circle">
                    <span className="bill-icon">i</span>
                  </div>
                  <div>
                    <h2 className="section-title">Notes</h2>
                    <p className="section-hint">
                      Optional information for yourself or your staff.
                    </p>
                  </div>
                </div>

                <div className="section-content">
                  <textarea
                    className="field-textarea"
                    rows="3"
                    placeholder="Add any details about this bill (e.g., payment method, adjustments, comments)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </section>

              {/* Footer buttons */}
              <div className="bill-footer">
                <button
                  type="button"
                  className="bill-btn secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button type="submit" className="bill-btn primary">
                  Save bill
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBill;
