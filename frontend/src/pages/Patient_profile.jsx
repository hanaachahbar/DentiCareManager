// src/components/PatientProfile.jsx
import React, { useState } from 'react';
import { User, Calendar, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Patient_profile.css';

const PatientProfile = () => {
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const [patient, setPatient] = useState({
    name: 'Laura Williams',
    id: 'Patient ID: P001',
    dateOfBirth: '12-08-1990',
    contact: '+1 234 567 890',
    email: 'laura.w@example.com',
    emergencyContact: 'John Williams (+1 (06) 765 432)',
    primaryDentist: 'Dr Emily Carter',
    allergies: 'Penicillin',
    chronicConditions: 'Hypertension',
    notes:
      'Patient experiences anxiety during dental procedures. Prefers morning appointments.',
  });

  const [editForm, setEditForm] = useState({ ...patient });

  const [services, setServices] = useState([
    {
      id: 1,
      title: 'ODF Treatment',
      totalPayment: '$195',
      appointments: [
        { name: 'Initial Consultation & Review Fitting', date: '05-11-2023' },
      ],
    },
    {
      id: 2,
      title: 'Whitening Treatment',
      totalPayment: '$120',
      appointments: [
        { name: 'In-Office Whitening Session', date: '12-08-2023' },
      ],
    },
  ]);

  const [documents] = useState([
    { name: 'dental-xray-1.png', date: '12-05-2023' },
    { name: 'consent-form.pdf', date: '10-05-2023' },
  ]);

  const [newService, setNewService] = useState({
    title: '',
    description: '',
    totalPayment: '',
  });

  const handleServiceClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  const openAddServiceModal = () => {
    setNewService({ title: '', description: '', totalPayment: '' });
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

  const handleCreateService = () => {
    if (!newService.title || !newService.totalPayment) {
      alert('Please fill service name and total payment.');
      return;
    }

    const nextId =
      services.length > 0
        ? Math.max(...services.map((s) => s.id)) + 1
        : 1;

    const created = {
      id: nextId,
      title: newService.title,
      totalPayment: newService.totalPayment,
      description: newService.description,
      appointments: [],
    };

    setServices((prev) => [created, ...prev]);
    setIsAddServiceModalOpen(false);
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

  const handleSaveChanges = () => {
    setPatient({ ...editForm });
    setIsEditModalOpen(false);
  };

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
              + Add New Category or Service
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
                <h2 className="patient-name">{patient.name}</h2>
                <p className="patient-id">{patient.id}</p>
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
                  <p className="personal-value">{patient.dateOfBirth}</p>
                </div>
                <div className="personal-item">
                  <p className="personal-label">Contact</p>
                  <p className="personal-value">{patient.contact}</p>
                </div>
                <div className="personal-item">
                  <p className="personal-label">Email</p>
                  <p className="personal-value">{patient.email}</p>
                </div>
                <div className="personal-item">
                  <p className="personal-label">Emergency contact</p>
                  <p className="personal-value">
                    {patient.emergencyContact}
                  </p>
                </div>
                <div className="personal-item">
                  <p className="personal-label">Primary dentist</p>
                  <p className="personal-value">
                    {patient.primaryDentist}
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
                    {patient.allergies}
                  </p>
                </div>
                <div className="medical-item">
                  <p className="medical-label">Chronic conditions</p>
                  <p className="medical-value">
                    {patient.chronicConditions}
                  </p>
                </div>
              </div>
              <div className="medical-notes">
                <p className="medical-label">Notes</p>
                <p className="medical-notes-value">{patient.notes}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Services */}
            {services.map((service) => (
              <div key={service.id} className="card service-card">
                <div className="service-header-row">
                  <div>
                    <h3 className="card-title service-title-strong">
                      {service.title}
                    </h3>
                    {service.totalPayment && (
                      <p className="service-total-payment">
                        Total payment: {service.totalPayment}
                      </p>
                    )}
                  </div>
                  <button
                    className="btn-outline"
                    onClick={() => handleServiceClick(service.id)}
                  >
                    View details
                  </button>
                </div>

                <div className="section">
                  <h4 className="section-title">Last appointment</h4>
                  {service.appointments.length === 0 ? (
                    <p className="no-appointments-text">
                      No appointments yet for this service.
                    </p>
                  ) : (
                    service.appointments.map((apt, idx) => (
                      <div key={idx} className="appointment-item">
                        <Calendar className="appointment-icon" />
                        <div>
                          <p className="appointment-name-normal">
                            {apt.name}
                          </p>
                          <p className="appointment-date">{apt.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

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
                {documents.map((doc, idx) => (
                  <div key={idx} className="document-item">
                    <div>
                      <p className="document-name">{doc.name}</p>
                      <p className="document-date">{doc.date}</p>
                    </div>
                    <button className="btn-icon">
                      <Download className="icon-small" />
                    </button>
                  </div>
                ))}
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
              {/* Personal Details Section */}
              <div className="form-section">
                <h3 className="form-section-title">Personal Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="text"
                      name="dateOfBirth"
                      value={editForm.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact</label>
                    <input
                      type="text"
                      name="contact"
                      value={editForm.contact}
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
                      name="emergencyContact"
                      value={editForm.emergencyContact}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Primary Dentist</label>
                    <input
                      type="text"
                      name="primaryDentist"
                      value={editForm.primaryDentist}
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
                      name="chronicConditions"
                      value={editForm.chronicConditions}
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
                    name="title"
                    value={newService.title}
                    onChange={handleNewServiceChange}
                    className="form-input"
                    placeholder="e.g., ODF Treatment"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={newService.description}
                    onChange={handleNewServiceChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Short description of this service..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total payment</label>
                  <input
                    type="text"
                    name="totalPayment"
                    value={newService.totalPayment}
                    onChange={handleNewServiceChange}
                    className="form-input"
                    placeholder="$0"
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
