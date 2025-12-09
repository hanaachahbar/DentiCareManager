import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Patient_profile.css';

function Patient_profile() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  
  // Fake patient data - replace this with real API call later
  const [patient] = useState({
    patient_id: 'P001',
    first_name: 'Fatima',
    last_name: 'Ahmed',
    date_of_birth: '15/08/1990',
    gender: 'Female',
    phone_number: '+213 555 123 456',
    email: 'fatima.ahmed@example.com',
    address: '123 Rue Didouche Mourad',
    city: 'Algiers',
    emergency_call: 'Sara Ahmed (+213 555 987 654)',
    allergies: 'Penicillin, Latex',
    chronic_conditions: 'Hypertension',
    hereditary_conditions: 'Diabetes (Family History)',
    current_medications: 'Amlodipine (5mg daily)',
    notes: 'Patient experiences anxiety during dental procedures. Prefers morning appointments.',
    created_at: '2022-01-15'
  });

  // Fake services data with appointments, prescriptions, and documents
  const [services] = useState([
    {
      service_id: 1,
      patient_id: 'P001',
      service_name: 'ODF Treatment (Orthodontics)',
      status: 'active',
      created_at: '2022-10-15',
      appointments: [
        {
          appointment_id: 1,
          service_id: 1,
          appointment_date: '02-11-2022',
          status: 'checked-in',
          description: 'Initial Consultation & Braces Fitting',
          created_at: '2022-10-20',
          prescriptions: [
            {
              appointment_id: 1,
              medication_id: 1,
              medication_name: 'Ibuprofen',
              dosage: '400mg',
              frequency_per_day: 'Twice a day',
              duration_by_days: 7,
              description: 'Pain relief post-fitting'
            },
            {
              appointment_id: 1,
              medication_id: 2,
              medication_name: 'Chlorhexidine Mouthwash',
              dosage: '15ml',
              frequency_per_day: 'Twice a day',
              duration_by_days: 14,
              description: 'Oral hygiene maintenance'
            }
          ],
          documents: [
            {
              document_id: 1,
              appointment_id: 1,
              path: '/documents/xray-initial-2022-11-02.jpg',
              saved_at: '02-11-2022'
            },
            {
              document_id: 2,
              appointment_id: 1,
              path: '/documents/treatment-plan-odf.pdf',
              saved_at: '02-11-2022'
            }
          ]
        },
        {
          appointment_id: 2,
          service_id: 1,
          appointment_date: '15-01-2023',
          status: 'checked-in',
          description: 'First Adjustment Visit',
          created_at: '20-12-2022',
          prescriptions: [],
          documents: [
            {
              document_id: 5,
              appointment_id: 2,
              path: '/documents/progress-xray-2023-01-15.jpg',
              saved_at: '15-01-2023'
            }
          ]
        },
        {
          appointment_id: 3,
          service_id: 1,
          appointment_date: '10-12-2023',
          status: 'pending',
          description: 'Routine Check & Wire Tightening',
          created_at: '01-11-2023',
          prescriptions: [],
          documents: []
        }
      ]
    },
    {
      service_id: 2,
      patient_id: 'P001',
      service_name: 'Teeth Whitening Treatment',
      status: 'active',
      created_at: '2023-04-10',
      appointments: [
        {
          appointment_id: 4,
          service_id: 2,
          appointment_date: '12-05-2023',
          status: 'checked-in',
          description: 'In-Office Whitening Session',
          created_at: '15-04-2023',
          prescriptions: [
            {
              appointment_id: 4,
              medication_id: 3,
              medication_name: 'Sensitivity Relief Gel',
              dosage: 'Apply as needed',
              frequency_per_day: 'As needed',
              duration_by_days: 7,
              description: 'For tooth sensitivity after whitening'
            }
          ],
          documents: [
            {
              document_id: 3,
              appointment_id: 4,
              path: '/documents/before-whitening.jpg',
              saved_at: '12-05-2023'
            },
            {
              document_id: 4,
              appointment_id: 4,
              path: '/documents/after-whitening.jpg',
              saved_at: '12-05-2023'
            }
          ]
        }
      ]
    },
    {
      service_id: 3,
      patient_id: 'P001',
      service_name: 'Root Canal Treatment',
      status: 'not_active',
      created_at: '2023-08-05',
      appointments: [
        {
          appointment_id: 5,
          service_id: 3,
          appointment_date: '20-08-2023',
          status: 'cancelled',
          description: 'Root Canal Procedure - Tooth #14',
          created_at: '06-08-2023',
          prescriptions: [],
          documents: []
        }
      ]
    }
  ]);

  const [loading] = useState(false);

  // This useEffect will be used when you connect to real database
  /*
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/patients/${patientId}`);
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);
  */

  const handleAddNewService = () => {
    navigate('/add-service', { state: { patient } });
  };

  if (loading) {
    return <div>Loading patient data...</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

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
                    <img alt="Patient avatar" />
                    <h2 className="patient-name">{patient.first_name} {patient.last_name}</h2>
                    <p className="patient-id">Patient ID: {patient.patient_id}</p>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="card">
                  <h3 className="card-title">Personal Details</h3>
                  <div className="detail-list">
                    <div className="detail-row">
                      <span className="detail-label">Date of Birth:</span>
                      <span className="detail-value">{patient.date_of_birth}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Gender:</span>
                      <span className="detail-value">{patient.gender}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Contact:</span>
                      <span className="detail-value">{patient.phone_number}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{patient.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">{patient.address}, {patient.city}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Emergency Contact:</span>
                      <span className="detail-value">{patient.emergency_call}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="card">
                  <h3 className="card-title">Medical Information</h3>
                  <div className="detail-list">
                    
                    {patient.allergies && (
                      <div className="detail-block">
                        <span className="detail-label">Allergies:</span>
                        <p className="detail-value">{patient.allergies}</p>
                      </div>
                    )}

                    {patient.chronic_conditions && (
                      <div className="detail-block">
                        <span className="detail-label">Chronic Conditions:</span>
                        <p className="detail-value">{patient.chronic_conditions}</p>
                      </div>
                    )}

                    {patient.hereditary_conditions && (
                      <div className="detail-block">
                        <span className="detail-label">Hereditary Conditions:</span>
                        <p className="detail-value">{patient.hereditary_conditions}</p>
                      </div>
                    )}

                    {patient.current_medications && (
                      <div className="detail-block">
                        <span className="detail-label">Current Medications:</span>
                        <p className="detail-value">{patient.current_medications}</p>
                      </div>
                    )}

                    {patient.notes && (
                      <div className="detail-block">
                        <span className="detail-label">Notes:</span>
                        <p className="detail-value">{patient.notes}</p>
                      </div>
                    )}

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
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>INV-00123</td>
                          <td>12-05-2023</td>
                          <td>Whitening</td>
                          <td>$150.00</td>
                          <td><span className="badge badge-paid">Paid</span></td>
                        </tr>
                        <tr>
                          <td>INV-00115</td>
                          <td>25-01-2023</td>
                          <td>General</td>
                          <td>$75.00</td>
                          <td><span className="badge badge-paid">Paid</span></td>
                        </tr>
                        <tr>
                          <td>INV-00109</td>
                          <td>02-11-2022</td>
                          <td>ODF</td>
                          <td>$220.00</td>
                          <td><span className="badge badge-overdue">Overdue</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* Main Content Area */}
              <div className="main-area">
                {/* Services Section - Each service has its own card */}
                {services.map((service) => (
                  <div className="card" key={service.service_id}>
                    <div className="card-header-simple">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">{service.service_name}</h3>
                        <span className={`badge ${service.status === 'active' ? 'badge-success' : 'badge-inactive'}`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    <div className="treatment-section">
                      {/* Appointments for this service */}
                      <div className="subsection">
                        <h4 className="subsection-title">Appointments</h4>
                        {service.appointments && service.appointments.length > 0 ? (
                          service.appointments.map((appointment) => (
                            <div className="appointment-card" key={appointment.appointment_id}>
                              <div className="appointment-item">
                                <div className="appointment-info">
                                  <span className="appointment-name">{appointment.description}</span>
                                  <span className="appointment-date">{appointment.appointment_date}</span>
                                </div>
                                <span className={`badge ${
                                  appointment.status === 'checked-in' ? 'badge-success' : 
                                  appointment.status === 'pending' ? 'badge-warning' : 
                                  'badge-danger'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>

                              {/* Prescriptions for this appointment */}
                              {appointment.prescriptions && appointment.prescriptions.length > 0 && (
                                <div className="appointment-prescriptions">
                                  <h5 className="prescription-subtitle">Prescriptions</h5>
                                  <div className="table-container">
                                    <table className="table">
                                      <thead>
                                        <tr>
                                          <th>Medication</th>
                                          <th>Dosage</th>
                                          <th>Frequency</th>
                                          <th>Duration</th>
                                          <th>Notes</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {appointment.prescriptions.map((prescription, index) => (
                                          <tr key={index}>
                                            <td>{prescription.medication_name}</td>
                                            <td>{prescription.dosage}</td>
                                            <td>{prescription.frequency_per_day}</td>
                                            <td>{prescription.duration_by_days} days</td>
                                            <td>{prescription.description || '-'}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                              {/* Documents for this appointment */}
                              {appointment.documents && appointment.documents.length > 0 && (
                                <div className="appointment-documents">
                                  <h5 className="document-subtitle">Documents</h5>
                                  <div className="document-list">
                                    {appointment.documents.map((document) => (
                                      <div className="document-item" key={document.document_id}>
                                        <span className="document-icon">📄</span>
                                        <div className="document-info">
                                          <span className="document-name">{document.path.split('/').pop()}</span>
                                          <span className="document-date">{document.saved_at}</span>
                                        </div>
                                        <a className="link" href={document.path} download>Download</a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="no-data">No appointments scheduled</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Patient_profile;