import React, { useState, useEffect } from 'react';
import { User, Calendar, Download, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Patient_profile.css';

const PatientProfile = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const [patient, setPatient] = useState({
    patient_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    email: '',
    emergency_call: '',
    address: '',
    city: '',
    allergies: '',
    chronic_conditions: '',
    current_medications: '',
    notes: '',
  });

  const [editForm, setEditForm] = useState({ ...patient });

  const [services, setServices] = useState([]);

  const [newService, setNewService] = useState({
    service_name: '',
    total_cost: '',
    payment_description: '',
  });

  const [documents] = useState([
    { name: 'dental-xray-1.png', date: '12-05-2023' },
    { name: 'consent-form.pdf', date: '10-05-2023' },
  ]);

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient info
        const patientResponse = await fetch(
          `http://localhost:5000/api/patients/${patientId}`
        );
        if (!patientResponse.ok) throw new Error('Failed to fetch patient');
        const patientData = await patientResponse.json();
        
        setPatient(patientData);
        setEditForm(patientData);

        // Fetch services for this patient
        const servicesResponse = await fetch(
          `http://localhost:5000/api/services`
        );
        if (!servicesResponse.ok) throw new Error('Failed to fetch services');
        
        const servicesData = await servicesResponse.json();
        let servicesList = Array.isArray(servicesData) 
          ? servicesData 
          : servicesData.services || [];

        // Filter services for this patient
        const patientServices = servicesList.filter(
          (s) => s.patient_id === parseInt(patientId)
        );

        // Fetch appointments for each service
        const servicesWithAppointments = await Promise.all(
          patientServices.map(async (service) => {
            try {
              const appointmentsResponse = await fetch(
                `http://localhost:5000/api/appointments/service/${service.service_id}`
              );
              if (appointmentsResponse.ok) {
                const appointmentsData = await appointmentsResponse.json();
                const appointments = Array.isArray(appointmentsData)
                  ? appointmentsData
                  : appointmentsData.appointments || [];
                return {
                  ...service,
                  appointments: appointments,
                };
              }
            } catch (err) {
              console.error('Error fetching appointments:', err);
            }
            return { ...service, appointments: [] };
          })
        );

        setServices(servicesWithAppointments);
        setError(null);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient information');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const handleServiceClick = (serviceId) => {
    navigate(`/service-details?serviceId=${serviceId}`);
  };

  const openAddServiceModal = () => {
    setNewService({ service_name: '', total_cost: '', payment_description: '' });
    setIsAddServiceModalOpen(true);
  };

  const closeAddServiceModal = () => {
    setIsAddServiceModalOpen(false);
  };

  const handleNewServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateService = async () => {
    if (!newService.service_name || !newService.total_cost) {
      alert('Please fill service name and total cost.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: parseInt(patientId),
          service_name: newService.service_name,
          total_cost: parseFloat(newService.total_cost),
          payment_description: newService.payment_description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create service');
      }

      const result = await response.json();
      
      const createdService = {
        service_id: result.service_data.service_id,
        service_name: result.service_data.service_name,
        patient_id: result.service_data.patient_id,
        total_amount: result.service_data.total_cost,
        appointments: [],
      };

      setServices((prev) => [createdService, ...prev]);
      setIsAddServiceModalOpen(false);
      alert('Service created successfully!');
    } catch (err) {
      console.error('Error creating service:', err);
      alert('Failed to create service: ' + err.message);
    }
  };

  const openEditModal = () => {
    setEditForm({ ...patient });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/patients/${patientId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update patient');
      }

      setPatient({ ...editForm });
      setIsEditModalOpen(false);
      alert('Patient information updated successfully!');
    } catch (err) {
      console.error('Error updating patient:', err);
      alert('Failed to update patient: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="patient-profile-container">
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#7f8c8d' }}>
          Loading patient information...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-profile-container">
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#d32f2f' }}>
          {error}
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'block',
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-profile-container">
      <div className="patient-profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">Patient Profile</h1>
          <div className="header-buttons">
            <button onClick={openEditModal} className="btn-primary">
              Edit Patient
            </button>
            <button
              type="button"
              onClick={openAddServiceModal}
              className="btn-accent"
            >
              + Add New Service
            </button>
          </div>
        </div>

        <div className="profile-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Patient Card */}
            <div className="card patient-card">
              <div className="patient-info">
                <div className="patient-avatar">
                  <User className="avatar-icon" />
                </div>
                <h2 className="patient-name">
                  {patient.first_name} {patient.last_name}
                </h2>
                <p className="patient-id">Patient ID: {patient.patient_id}</p>
              </div>
            </div>

            {/* Personal Details */}
            <div className="card personal-card">
              <div className="card-header-inline">
                <h3 className="card-title">Personal details</h3>
              </div>
              <div className="personal-grid">
                <div className="personal-item">
                  <p className="personal-label">Date of birth</p>
                  <p className="personal-value">
                    {patient.date_of_birth || 'N/A'}
                  </p>
                </div>
                <div className="personal-item">
                  <p className="personal-label">Gender</p>
                  <p className="personal-value">{patient.gender || 'N/A'}</p>
                </div>
                <div className="personal-item">
                  <p className="personal-label">Contact</p>
                  <p className="personal-value">
                    {patient.phone_number || 'N/A'}
                  </p>
                </div>
                <div className="personal-item">
                  <p className="personal-label">Email</p>
                  <p className="personal-value">{patient.email || 'N/A'}</p>
                </div>
                <div className="personal-item">
                  <p className="personal-label">Emergency contact</p>
                  <p className="personal-value">
                    {patient.emergency_call || 'N/A'}
                  </p>
                </div>
                <div className="personal-item">
                  <p className="personal-label">Address</p>
                  <p className="personal-value">
                    {patient.address && patient.city
                      ? `${patient.address}, ${patient.city}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="card medical-card">
              <div className="card-header-inline">
                <h3 className="card-title">Medical information</h3>
              </div>
              <div className="medical-grid">
                <div className="medical-item">
                  <p className="medical-label">Allergies</p>
                  <p className="medical-value medical-danger">
                    {patient.allergies || 'None'}
                  </p>
                </div>
                <div className="medical-item">
                  <p className="medical-label">Chronic conditions</p>
                  <p className="medical-value">
                    {patient.chronic_conditions || 'None'}
                  </p>
                </div>
                <div className="medical-item">
                  <p className="medical-label">Current medications</p>
                  <p className="medical-value">
                    {patient.current_medications || 'None'}
                  </p>
                </div>
              </div>
              <div className="medical-notes">
                <p className="medical-label">Notes</p>
                <p className="medical-notes-value">
                  {patient.notes || 'No notes'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {services.length === 0 ? (
              <div className="card">
                <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '30px' }}>
                  No services added yet. Click "Add New Service" to get started.
                </p>
              </div>
            ) : (
              services.map((service) => (
                <div key={service.service_id} className="card service-card">
                  <div className="service-header-row">
                    <div>
                      <h3 className="card-title service-title-strong">
                        {service.service_name}
                      </h3>
                      <p className="service-total-payment">
                        Total: ${parseFloat(service.total_amount || 0).toFixed(2)}
                      </p>
                    </div>
                    <button
                      className="btn-outline"
                      onClick={() => handleServiceClick(service.service_id)}
                    >
                      View details
                    </button>
                  </div>

                  <div className="section">
                    <h4 className="section-title">Appointments</h4>
                    {service.appointments && service.appointments.length === 0 ? (
                      <p className="no-appointments-text">
                        No appointments yet for this service.
                      </p>
                    ) : (
                      service.appointments &&
                      service.appointments.map((apt, idx) => (
                        <div key={idx} className="appointment-item">
                          <Calendar className="appointment-icon" />
                          <div>
                            <p className="appointment-name-normal">
                              Appointment #{apt.appointment_id}
                            </p>
                            <p className="appointment-date">
                              {new Date(apt.appointment_date).toLocaleDateString()} 
                              {apt.appointment_time && ` at ${apt.appointment_time}`}
                            </p>
                            <p className="appointment-status">
                              Status: <strong>{apt.status}</strong>
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Documents */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Documents</h3>
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="search-input-small"
                />
              </div>
              <div className="documents-list">
                {documents.length === 0 ? (
                  <p style={{ padding: '15px', color: '#7f8c8d', textAlign: 'center' }}>
                    No documents
                  </p>
                ) : (
                  documents.map((doc, idx) => (
                    <div key={idx} className="document-item">
                      <div>
                        <p className="document-name">{doc.name}</p>
                        <p className="document-date">{doc.date}</p>
                      </div>
                      <button className="btn-icon">
                        <Download className="icon-small" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Patient Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">Edit Patient Information</h2>
              <button onClick={closeEditModal} className="btn-close">
                <X className="icon-medium" />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-section">
                <h3 className="form-section-title">Personal Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={editForm.first_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={editForm.last_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editForm.date_of_birth || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <input
                      type="text"
                      name="gender"
                      value={editForm.gender}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={editForm.phone_number}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Emergency Contact</label>
                    <input
                      type="text"
                      name="emergency_call"
                      value={editForm.emergency_call}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editForm.address}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={editForm.city}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">Medical Information</h3>
                <div className="form-group-list">
                  <div className="form-group">
                    <label className="form-label">Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      value={editForm.allergies}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chronic Conditions</label>
                    <input
                      type="text"
                      name="chronic_conditions"
                      value={editForm.chronic_conditions}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Medications</label>
                    <input
                      type="text"
                      name="current_medications"
                      value={editForm.current_medications}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      name="notes"
                      value={editForm.notes}
                      onChange={handleInputChange}
                      rows="4"
                      className="form-textarea"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={closeEditModal} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleSaveChanges} className="btn-save">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddServiceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container modal-container-narrow">
            <div className="modal-header">
              <h2 className="modal-title">Add new service</h2>
              <button
                onClick={closeAddServiceModal}
                className="btn-close"
              >
                <X className="icon-medium" />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">Service name</label>
                  <input
                    type="text"
                    name="service_name"
                    value={newService.service_name}
                    onChange={handleNewServiceChange}
                    className="form-input"
                    placeholder="e.g., Root Canal Treatment"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Cost</label>
                  <input
                    type="number"
                    name="total_cost"
                    value={newService.total_cost}
                    onChange={handleNewServiceChange}
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Description (optional)</label>
                  <textarea
                    name="payment_description"
                    value={newService.payment_description}
                    onChange={handleNewServiceChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Description for payment records..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={closeAddServiceModal}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateService}
                className="btn-save"
              >
                Create service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
