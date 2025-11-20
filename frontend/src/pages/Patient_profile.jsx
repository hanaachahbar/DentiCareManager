import React from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import '../styles/Patient_profile.css';

const PatientProfile = () => {
  const navigate = useNavigate(); // Add this hook

  // Patient data (you can pass this via props or context later)
  const patientData = {
    id: 'P001',
    name: 'Fatima'
  };

  // Handler for Add New Service button
  const handleAddNewService = () => {
    navigate('/add-service', { state: { patient: patientData } });
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
            <div className="avatar" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAsf5LWoTeUxrpU8nlyg0A93PFskogMH1xRmI7CTKQtO_SFiH9p3dkS71WpIRclxOlfS8PO_IQOHTqfQYicYNhRFbYWenNLQwVxmJGkBoRxj1iFwteZw2jgOrkqJydkBLBw2vLz_ZlpdQA6NDWd-9Qar3EJlUYkQCcEecfSmMjmiHem-1dsewY428PBLpXQezJAZ58eNcECxrn5CTbU0BvWg9OU84Ujx0JQqurnaxEgTjcGEp9hv-2erHBNdULD7uPn0mvJrsy0uhI)")'}}></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-wrapper">
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">Patient Profile</h1>
              <div className="header-actions">
                <button className="btn btn-primary">
                  <span className="icon">✏️</span>
                  <span>Edit Patient</span>
                </button>
                <button className="btn btn-secondary" onClick={handleAddNewService}>
                  <span className="icon">+</span>
                  <span>Add New Service</span>
                </button>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid-layout">
              {/* Left Sidebar */}
              <div className="sidebar">
                {/* Patient Card */}
                <div className="card">
                  <div className="patient-avatar-section">
                    <img  className="patient-avatar"/>
                    <h2 className="patient-name">Fatima</h2>
                    <p className="patient-id">Patient ID: P001</p>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="card">
                  <h3 className="card-title">Personal Details</h3>
                  <div className="detail-list">
                    <div className="detail-row">
                      <span className="detail-label">Date of Birth:</span>
                      <span className="detail-value">15/08/1990</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Contact:</span>
                      <span className="detail-value">+1 234 567 890</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">laura.w@example.com</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Emergency Contact:</span>
                      <span className="detail-value">John Williams (+1 098 765 432)</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Primary Dentist:</span>
                      <span className="detail-value">Dr. Emily Carter</span>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="card">
                  <h3 className="card-title">Medical Information</h3>
                  <div className="detail-list">

                    <div className="detail-block">
                      <span className="detail-label">Allergies:</span>
                      <p className="detail-value">Penicillin</p>
                    </div>

                    <div className="detail-block">
                      <span className="detail-label">Chronic Conditions:</span>
                      <p className="detail-value">Hypertension</p>
                    </div>

                    <div className="detail-block">
                      <span className="detail-label">Current Medications:</span>
                      <p className="detail-value">Amlodipine (5mg daily)</p>
                    </div>

                    <div className="detail-block">
                      <span className="detail-label">Notes:</span>
                      <p className="detail-value">
                        Patient experiences anxiety during dental procedures. Prefers morning appointments.
                      </p>
                    </div>

                  </div>
                </div>


                {/* Documents */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Documents</h3>
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input className="search-input" placeholder="Search documents..." type="text"/>
                    </div>
                  </div>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>File Name</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>dental-xray-1.jpg</td>
                          <td>12-05-2023</td>
                          <td><a className="link" href="#">Download</a></td>
                        </tr>
                        <tr>
                          <td>consent-form.pdf</td>
                          <td>10-05-2023</td>
                          <td><a className="link" href="#">Download</a></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="main-area">
                {/* ODF Treatment */}
                <div className="card">
                  <div className="card-header-simple">
                    <h3 className="card-title">ODF Treatment</h3>
                  </div>
                  <div className="treatment-section">
                    <div className="subsection">
                      <h4 className="subsection-title">Appointments</h4>
                      <div className="appointment-item">
                        <div className="appointment-info">
                          <span className="appointment-name">Initial Consultation & Braces Fitting</span>
                          <span className="appointment-date">02-11-2022</span>
                        </div>
                        <span className="link-button">View Details</span>
                      </div>
                    </div>
                    <div className="subsection">
                      <h4 className="subsection-title">Prescriptions</h4>
                      <div className="table-container">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Medication</th>
                              <th>Dosage</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>02-11-2022</td>
                              <td>Pain Reliever (Post-fitting)</td>
                              <td>400mg</td>
                              <td><span className="badge badge-success">Completed</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Whitening Treatment */}
                <div className="card">
                  <div className="card-header-simple">
                    <h3 className="card-title">Whitening Treatment</h3>
                  </div>
                  <div className="treatment-section">
                    <div className="subsection">
                      <h4 className="subsection-title">Appointments</h4>
                      <div className="appointment-item">
                        <div className="appointment-info">
                          <span className="appointment-name">In-Office Whitening Session</span>
                          <span className="appointment-date">12-05-2023</span>
                        </div>
                        <span className="link-button">View Details</span>
                      </div>
                    </div>
                    <div className="subsection">
                      <h4 className="subsection-title">Prescriptions</h4>
                      <div className="table-container">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Medication</th>
                              <th>Dosage</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>15-02-2023</td>
                              <td>Ibuprofen</td>
                              <td>200mg</td>
                              <td><span className="badge badge-success">Completed</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prescription History */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Prescription History (General)</h3>
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input className="search-input" placeholder="Filter prescriptions..." type="text"/>
                    </div>
                  </div>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Medication</th>
                          <th>Dosage</th>
                          <th>Category</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>12-05-2023</td>
                          <td>Amoxicillin</td>
                          <td>500mg</td>
                          <td>General</td>
                          <td><span className="badge badge-success">Completed</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment History */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Payment History</h3>
                    <div className="search-box">
                      <span className="search-icon">🔍</span>
                      <input className="search-input" placeholder="Filter payments..." type="text"/>
                    </div>
                  </div>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Invoice ID</th>
                          <th>Date</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>INV-00123</td>
                          <td>12-05-2023</td>
                          <td>Whitening</td>
                          <td>$150.00</td>
                          <td><span className="badge badge-paid">Paid</span></td>
                          <td><a className="link" href="#">View</a></td>
                        </tr>
                        <tr>
                          <td>INV-00115</td>
                          <td>25-01-2023</td>
                          <td>General</td>
                          <td>$75.00</td>
                          <td><span className="badge badge-paid">Paid</span></td>
                          <td><a className="link" href="#">View</a></td>
                        </tr>
                        <tr>
                          <td>INV-00109</td>
                          <td>02-11-2022</td>
                          <td>ODF</td>
                          <td>$220.00</td>
                          <td><span className="badge badge-overdue">Overdue</span></td>
                          <td><a className="link" href="#">View</a></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;