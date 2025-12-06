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

    // Validation
    if (!serviceName || !description || !totalPayment) {
      alert('Please fill in all fields');
      return;
    }

    // Here you would typically send this data to your backend
    const serviceData = {
      patientId: patientData.id,
      patientName: patientData.name,
      serviceName,
      description,
      totalPayment: parseFloat(totalPayment),
      date: new Date().toISOString()
    };

    console.log('Service Data:', serviceData);
    
    // TODO: Send to backend API
    // await fetch('/api/services', { method: 'POST', body: JSON.stringify(serviceData) });

    // Navigate back to profile
    alert('Service added successfully!');
    navigate(-1); // Go back to previous page
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="app-container">
      <div className="layout-container">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-icon">
                <svg className="logo-svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.5 2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h5Z"></path>
                  <path d="M12 10a2 2 0 0 1 2 2v7a2 2 0 0 1-4 0v-7a2 2 0 0 1 2-2Z"></path>
                  <path d="M9.5 2.5a2.5 2.5 0 0 0-4.99 0h-1.02a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1.02a2.5 2.5 0 1 1 4.98 0Z"></path>
                  <path d="m19 2.5a2.5 2.5 0 1 1-5 0h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a2.5 2.5 0 0 1 5 0Z"></path>
                  <path d="M12 22a8.5 8.5 0 0 1-8.5-8.5V9a.5.5 0 0 1 .5-.5h16a.5.5 0 0 1 .5.5v4.5A8.5 8.5 0 0 1 12 22Z"></path>
                </svg>
              </div>
              <h2 className="logo-text">DentalCare</h2>
            </div>
            <nav className="nav-links">
              <a className="nav-link" href="#">Dashboard</a>
              <a className="nav-link active" href="#">Patients</a>
              <a className="nav-link" href="#">Appointments</a>
              <a className="nav-link" href="#">Payment</a>
              <a className="nav-link" href="#">Prescription</a>
            </nav>
          </div>
          <div className="header-right">
            <div className="avatar"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="form-wrapper">
            {/* Form Card */}
            <div className="form-card">
              <div className="form-header">
                <h1 className="form-title">Add New Service</h1>
                <p className="form-subtitle">
                  Patient: <strong>{patientData.name}</strong> (ID: {patientData.id})
                </p>
              </div>

              <form onSubmit={handleSubmit} className="service-form">
                {/* Service Name */}
                <div className="form-group">
                  <label htmlFor="serviceName" className="form-label">
                    Service Name <span className="required">*</span>
                  </label>
                  <input
                    id="serviceName"
                    type="text"
                    className="form-input"
                    placeholder="e.g., ODF Treatment, Whitening, Root Canal"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    className="form-textarea"
                    placeholder="Describe the service details, treatment plan, or any relevant information..."
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Total Payment */}
                <div className="form-group">
                  <label htmlFor="totalPayment" className="form-label">
                    Total Payment <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">$</span>
                    <input
                      id="totalPayment"
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input with-icon"
                      placeholder="0.00"
                      value={totalPayment}
                      onChange={(e) => setTotalPayment(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button type="button" className="btn btn-cancel" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-submit">
                    Add Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddServiceForm;