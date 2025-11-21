import React, { useState } from 'react';
import '../styles/ODF.css';

export default function DentalCareApp() {
  const [appointmentName, setAppointmentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  
  // State to manage appointments list
  const [appointments, setAppointments] = useState([
    
    {
      id: 3,
      date: '20 Jun 2023',
      description: 'X-Rays and Molds',
      bills: [{ amount: 100, status: 'Paid' }],
      prescriptions: [{ name: 'Prescription 2', date: '20 Jun 2023' }],
      files: [{ name: 'xray_results.pdf', date: '20 Jun 2023' }]
    }
  ]);

  const documents = [
    { name: 'Treatment_Plan_ODF.pdf', date: '15 Jul 2023', type: 'description' },
    { name: 'X-Ray_20_Jun_2023.jpg', date: '20 Jun 2023', type: 'image' }
  ];

  // Function to add new appointment (your friend will call this after form submission)
  const addNewAppointment = (appointmentData) => {
    const newAppointment = {
      id: appointments.length + 1,
      date: appointmentData.date,
      description: appointmentData.description,
      bills: [], // Empty array
      prescriptions: [], // Empty array
      files: [] // Empty array
    };
    
    setAppointments([newAppointment, ...appointments]); // Add to beginning of list
  };

  // Function to add bill to an appointment
  const addBillToAppointment = (appointmentId, billData) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, bills: [...apt.bills, { amount: billData.amount, status: billData.status || 'Pending' }] }
        : apt
    ));
  };

  // Function to add prescription to an appointment
  const addPrescriptionToAppointment = (appointmentId, prescriptionData) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, prescriptions: [...apt.prescriptions, { name: prescriptionData.name, date: prescriptionData.date }] }
        : apt
    ));
  };

  // Function to upload file to an appointment
  const uploadFileToAppointment = (appointmentId, fileData) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, files: [...apt.files, { name: fileData.name, date: fileData.date }] }
        : apt
    ));
  };

  // Handler for Add New Appointment button
  const handleAddAppointment = () => {
    window.location.href = '/appointments/new';
  };

  // Handlers for the three action buttons
  const handleAddBill = (appointmentId) => {
    // Your friend will create this form
    console.log('Add bill to appointment:', appointmentId);
    // Example: navigate to bill form or open modal
    // window.location.href = `/appointments/${appointmentId}/add-bill`;
  };

  const handleAddPrescription = (appointmentId) => {
    // Your friend will create this form
    console.log('Add prescription to appointment:', appointmentId);
    // window.location.href = `/appointments/${appointmentId}/add-prescription`;
  };

  const handleUploadFile = (appointmentId) => {
    // Your friend will create this form
    console.log('Upload file to appointment:', appointmentId);
    // window.location.href = `/appointments/${appointmentId}/upload-file`;
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
        <div className="breadcrumb">
          <a href="#home">Home</a>
          <span>/</span>
          <a href="#patients">Patients</a>
          <span>/</span>
          <a href="#jane">Jane Doe</a>
          <span>/</span>
          <span className="current">ODF</span>
        </div>

        <div className="page-header">
          <div>
            <h1>ODF - Orthodontic Treatments</h1>
            <p className="subtitle">Patient: Jane Doe (ID: P735-87654)</p>
          </div>
        </div>

        <div className="grid-layout">
          <div className="main-column">
            <div className="card">
              <div className="card-header">
                <h2>New Appointment</h2>
                <button className="btn-action" onClick={handleAddAppointment}>
                  <span>📄</span>
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
                      {/* Bills Section */}
                      <div className="detail-section">
                        <h4>Bills</h4>
                        {apt.bills.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                            {apt.bills.map((bill, idx) => (
                              <div key={idx} className="bill-item">
                                <p className="amount">${bill.amount}</p>
                                <span className={`status status-${bill.status.toLowerCase()}`}>
                                  {bill.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <button 
                          className="btn-action" 
                          onClick={() => handleAddBill(apt.id)}
                          style={{ width: '100%' }}
                        >
                          <span>📄</span>
                          <span>Add New Bill</span>
                        </button>
                      </div>

                      {/* Prescriptions Section */}
                      <div className="detail-section">
                        <h4>Prescriptions</h4>
                        {apt.prescriptions.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                            {apt.prescriptions.map((prescription, idx) => (
                              <div key={idx} className="detail-item">
                                <span className="icon">💊</span>
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
                          <span>💊</span>
                          <span>Add New Prescription</span>
                        </button>
                      </div>

                      {/* Files Section */}
                      <div className="detail-section">
                        <h4>Uploaded Files</h4>
                        {apt.files.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                            {apt.files.map((file, idx) => (
                              <div key={idx} className="detail-item">
                                <span className="icon">📄</span>
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
                          <span>📤</span>
                          <span>Upload File</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar">
            <div>
              <div className="sidebar-header">
                <h2>Documents</h2>
                <div className="doc-search">
                  <span className="search-icon">🔍</span>
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
                    <span className="download-icon">⬇️</span>
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