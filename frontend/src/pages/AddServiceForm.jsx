// src/components/AddServiceForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AddServiceForm.css';

const AddServiceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientData = location.state?.patient || { id: '', name: '' };

  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [totalPayment, setTotalPayment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!serviceName || !description || !totalPayment) {
      alert('Please fill in all fields');
      return;
    }

    const serviceData = {
      patientId: patientData.id,
      patientName: patientData.name,
      serviceName,
      description,
      totalPayment: parseFloat(totalPayment),
      date: new Date().toISOString(),
    };

    console.log('Service Data:', serviceData);
    alert('Service added successfully!');
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="add-service-container">
      <div className="add-service-wrapper">
        <div className="add-service-card">
          {/* Header bar (matches add appointment style) */}
          <div className="service-header">
            <button onClick={handleCancel} className="service-back-btn">
              ←
            </button>
            <div>
              <h1 className="service-header-title">New service for patient</h1>
              <p className="service-header-subtitle">
                {patientData.name
                  ? `Patient: ${patientData.name} (ID: ${patientData.id || '—'})`
                  : 'Link this service to a patient.'}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="service-body">
            <form onSubmit={handleSubmit} className="service-layout">
              {/* Service basics */}
              <section className="service-section">
                <div className="service-section-header">
                  <div className="service-icon-circle">
                    <span className="service-icon">S</span>
                  </div>
                  <div>
                    <h2 className="section-title">Service details</h2>
                    <p className="section-hint">
                      Give this treatment a clear name that you can reuse.
                    </p>
                  </div>
                </div>

                <div className="section-content">
                  <label className="field-label">Service name *</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g., ODF Treatment, Whitening, Root Canal"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                  />
                </div>
              </section>

              {/* Description */}
              <section className="service-section">
                <div className="service-section-header">
                  <div className="service-icon-circle">
                    <span className="service-icon">D</span>
                  </div>
                  <div>
                    <h2 className="section-title">Description</h2>
                    <p className="section-hint">
                      Short summary of what this service includes.
                    </p>
                  </div>
                </div>

                <div className="section-content">
                  <textarea
                    className="field-textarea"
                    rows="4"
                    placeholder="Describe the treatment plan, steps, or any important notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </section>

              {/* Payment */}
              <section className="service-section">
                <div className="service-section-header">
                  <div className="service-icon-circle">
                    <span className="service-icon">€</span>
                  </div>
                  <div>
                    <h2 className="section-title">Total payment</h2>
                    <p className="section-hint">
                      Set the overall price for this service.
                    </p>
                  </div>
                </div>

                <div className="section-content payment-row">
                  <div className="price-input-wrapper">
                    <span className="price-prefix">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="field-input price-input"
                      placeholder="0.00"
                      value={totalPayment}
                      onChange={(e) => setTotalPayment(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Footer buttons */}
              <div className="service-footer">
                <button
                  type="button"
                  className="footer-btn secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button type="submit" className="footer-btn primary">
                  Save service
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServiceForm;
