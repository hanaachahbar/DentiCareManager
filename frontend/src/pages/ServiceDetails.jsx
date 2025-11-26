import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ServiceDetails.css';

export default function DentalCareApp() {
  const [appointmentName, setAppointmentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const navigate = useNavigate();

  // State to manage appointments list with payment and invoice structure
  const [appointments, setAppointments] = useState([
    {
      id: 3,
      date: '20 Jun 2023',
      description: 'X-Rays and Molds',
      service_id: 'SRV-001',
      payment: {
        payment_id: 'PAY-001',
        service_id: 'SRV-001',
        amount: 850,
        status: 'completed'
      },
      invoice: {
        invoice_id: 'INV-2023-001',
        appointment_id: 3,
        amount: 850
      },
      prescriptions: [{ name: 'Prescription 2', date: '20 Jun 2023' }],
      files: [{ name: 'xray_results.pdf', date: '20 Jun 2023' }]
    },
    {
      id: 4,
      date: '15 Jul 2023',
      description: 'Orthodontic Consultation',
      service_id: 'SRV-002',
      payment: {
        payment_id: 'PAY-002',
        service_id: 'SRV-002',
        amount: 1200,
        status: 'in progress'
      },
      invoice: null,
      prescriptions: [],
      files: []
    }
  ]);

  const documents = [
    { name: 'Treatment_Plan_ODF.pdf', date: '15 Jul 2023', type: 'description' },
    { name: 'X-Ray_20_Jun_2023.jpg', date: '20 Jun 2023', type: 'image' }
  ];

  // Add New Appointment
  const addNewAppointment = (appointmentData) => {
    const newAppointment = {
      id: appointments.length + 1,
      date: appointmentData.date,
      description: appointmentData.description,
      service_id: appointmentData.service_id,
      payment: {
        payment_id: `PAY-${appointments.length + 1}`,
        service_id: appointmentData.service_id,
        amount: appointmentData.amount,
        status: 'unpayed'
      },
      invoice: null,
      prescriptions: [],
      files: []
    };
    
    setAppointments([newAppointment, ...appointments]);
  };

  // Add Prescription
  const addPrescriptionToAppointment = (appointmentId, prescriptionData) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, prescriptions: [...apt.prescriptions, { name: prescriptionData.name, date: prescriptionData.date }] }
        : apt
    ));
  };

  // Upload File
  const uploadFileToAppointment = (appointmentId, fileData) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, files: [...apt.files, { name: fileData.name, date: fileData.date }] }
        : apt
    ));
  };

  // Update Invoice
  const updateInvoice = (appointmentId, invoiceData) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { 
            ...apt, 
            invoice: {
              ...apt.invoice,
              ...invoiceData
            }
          }
        : apt
    ));
  };

  // Update Payment Status
  const updatePaymentStatus = (appointmentId, status) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { 
            ...apt, 
            payment: { ...apt.payment, status: status }
          }
        : apt
    ));
  };

  // Go to Add Appointment Page
  const handleAddAppointment = () => {
    navigate('/add-appointment');
  };

  // Edit Invoice
  const handleEditInvoice = (appointmentId, invoiceId) => {
    navigate(`/appointments/${appointmentId}/invoice/${invoiceId}/edit`);
  };

  // Manage Invoice
  const handleManageInvoice = (appointmentId) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    
    if (appointment.invoice) {
      navigate(`/appointments/${appointmentId}/invoice`);
    } else {
      navigate(`/appointments/${appointmentId}/invoice/new`);
    }
  };

  // ⬅️ UPDATED → Navigate to PrescriptionManagement.js
  const handleAddPrescription = (appointmentId) => {
    navigate(`/appointments/${appointmentId}/prescriptions`); 
  };

  const handleUploadFile = (appointmentId) => {
    navigate(`/appointments/${appointmentId}/upload-file`);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <svg className="logo-icon" fill="none" viewBox="0 0 48 48">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
            </svg>
            <h2 className="logo-text">DentalCare</h2>
          </div>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right">
          <nav className="nav-links">
            <a href="#dashboard">Dashboard</a>
            <a href="#patients" className="active">Patients</a>
            <a href="#appointments">Appointments</a>
            <a href="#reports">Reports</a>
          </nav>
          <div className="header-actions">
            <button className="btn-primary">New Patient</button>
            <button className="btn-secondary">Settings</button>
            <button className="btn-icon">🔔</button>
            <div className="avatar"></div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Service Details</h1>
            <p className="subtitle">Patient: Jane Doe (ID: P735-87654)</p>
          </div>
        </div>

        <div className="grid-layout">
          <div className="main-column">
            <div className="card">
              <div className="card-header">
                <h2>New Appointment</h2>
                <button className="btn-action" onClick={handleAddAppointment}>
                  <span>Add New Appointment</span>
                </button>
              </div>
            </div>

            <div>
              <h2 className="section-title">Appointments</h2>
              <div className="appointments-list">
                {appointments.map((apt) => (
                  <div key={apt.id} className="appointment-card">
                    <div className="appointment-header">
                      <h3>Appointment: {apt.date}</h3>
                      <p>{apt.description}</p>
                    </div>

                    <div className="appointment-body">
                      {/* Payment & Invoice Section */}
                      <div className="detail-section">
                        <h4>Payment & Invoice</h4>

                        {apt.payment && (
                          <div style={{ marginBottom: '12px' }}>
                            <div className="payment-info">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>Total Amount:</span>
                                <p className="amount" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                                  ${apt.payment.amount}
                                </p>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>Status:</span>
                                <span className={`status status-${apt.payment.status.toLowerCase().replace(' ', '-')}`}>
                                  {apt.payment.status.charAt(0).toUpperCase() + apt.payment.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Invoice Section */}
                        {apt.invoice && (
                          <div style={{
                            padding: '12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            marginBottom: '12px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5%' }}>
                          <div style={{ width: '65%' }}>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>
                              Invoice #{apt.invoice.invoice_id}
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                              Amount: ${apt.invoice.amount}
                            </p>
                          </div>
                          <button 
                            className="btn-action" 
                            onClick={() => handleEditInvoice(apt.id, apt.invoice.invoice_id)}
                            style={{ padding: '6px 12px', fontSize: '13px', width: '30%', flexShrink: 0 }}
                          >
                            <span>Edit</span>
                          </button>
                        </div>
                          </div>
                        )}

                        <button 
                          className="btn-action" 
                          onClick={() => handleManageInvoice(apt.id)}
                          style={{ width: '100%' }}
                        >
                          <span>{apt.invoice ? 'View Invoice Details' : 'Create Invoice'}</span>
                        </button>
                      </div>

                      {/* ✅ UPDATED PRESCRIPTIONS SECTION */}
                      <div className="detail-section">
                    <h4>Prescriptions</h4>

                    {/* Display fake data only when no real prescriptions exist */}
                    {apt.prescriptions.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        <div className="detail-item">
                          <div>
                            <p className="item-title">Amoxicillin 500mg</p>
                            <p className="item-subtitle">Take one tablet three times daily for 7 days</p>
                            <p className="item-subtitle">Prescribed on 2024-01-15</p>
                          </div>
                        </div>
                        <div className="detail-item">
                          <div>
                            <p className="item-title">Ibuprofen 400mg</p>
                            <p className="item-subtitle">Take as needed for pain, maximum 3 times daily</p>
                            <p className="item-subtitle">Prescribed on 2024-01-15</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                        {apt.prescriptions.map((prescription, idx) => (
                          <div key={idx} className="detail-item">
                            <div>
                              <p className="item-title">{prescription.name}</p>
                              <p className="item-subtitle">Prescribed on {prescription.date}.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button 
                      className="btn-action" 
                      onClick={() => handleAddPrescription(apt.id)}
                      style={{ width: '100%' }}
                    >
                      <span>Manage Prescriptions</span>
                    </button>
                  </div>

                      {/* Files Section */}
                      <div className="detail-section">
                        <h4>Uploaded Files</h4>
                        {apt.files.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                            {apt.files.map((file, idx) => (
                              <div key={idx} className="detail-item">
                                <div>
                                  <p className="item-title">{file.name}</p>
                                  <p className="item-subtitle">Uploaded on {file.date}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <button 
                          className="btn-action" 
                          onClick={() => handleUploadFile(apt.id)}
                          style={{ width: '100%' }}
                        >
                          <span>Upload File</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div>
              <div className="sidebar-header">
                <h2>Documents</h2>
                <div className="doc-search">
                  <span className="search-icon"></span>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="documents-list">
                {documents.map((doc, idx) => (
                  <a key={idx} href="#download" className="document-item">
                    <span className="icon">{doc.type === 'image' ? '🖼️' : '📄'}</span>
                    <div className="doc-info">
                      <p className="doc-name">{doc.name}</p>
                      <p className="doc-date">Uploaded on {doc.date}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
