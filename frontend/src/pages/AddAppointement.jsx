import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

import { ArrowLeft, User, Calendar, Clock, FileText, Plus } from 'lucide-react';
import '../styles/AddAppointement.css';

const AddAppointmentPage = () => {
  const navigate = useNavigate();

  const [patients] = useState([
    'John Doe',
    'Jane Smith',
    'Michael Johnson',
    'Emily Williams',
    'David Brown',
    'Sarah Wilson',
    'Robert Taylor',
    'Lisa Anderson',
    'James Martinez',
    'Maria Garcia',
    'William Davis',
    'Emma Thompson',
    'Christopher Lee',
    'Olivia White'
  ]);

  const [services] = useState([
    'Routine Check-up',
    'Dental Cleaning',
    'Filling',
    'X-Ray',
    'Blood Test',
    'Consultation',
    'Follow-up',
    'Vaccination'
  ]);

  const [formData, setFormData] = useState({
    patient: '',
    date: '',
    time: '',
    service: '',
    reason: '',
    description: '',
    status: 'Pending'
  });

  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [filteredServices, setFilteredServices] = useState(services);
  const [isNewService, setIsNewService] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handlePatientInputChange = (value) => {
    setFormData({...formData, patient: value});
    setShowPatientDropdown(true);
    const filtered = patients.filter(patient =>
      patient.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPatients(filtered);
  };

  const handlePatientSelect = (patient) => {
    setFormData({...formData, patient: patient});
    setShowPatientDropdown(false);
  };

  const handleServiceInputChange = (value) => {
    setFormData({...formData, service: value});
    setShowServiceDropdown(true);
    setIsNewService(false);
    const filtered = services.filter(service =>
      service.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredServices(filtered);
    
    if (filtered.length === 0 && value.trim()) {
      setIsNewService(true);
    }
  };

  const handleServiceSelect = (service) => {
    setFormData({...formData, service: service});
    setShowServiceDropdown(false);
    setIsNewService(false);
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.patient.trim()) {
      errors.patient = 'Patient name is required';
    } else if (formData.patient.trim().length < 2) {
      errors.patient = 'Patient name must be at least 2 characters';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.time) {
      errors.time = 'Time is required';
    }

    if (!formData.service.trim()) {
      errors.service = 'Service name is required';
    } else if (formData.service.trim().length < 3) {
      errors.service = 'Service name must be at least 3 characters';
    }

    if (!formData.reason.trim()) {
      errors.reason = 'Reason for visit is required';
    } else if (formData.reason.trim().length < 3) {
      errors.reason = 'Reason must be at least 3 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const appointmentDate = new Date(formData.date + 'T00:00:00');
    
    const newAppointment = {
      id: (Math.random() * 100000).toFixed(0),
      patient: formData.patient.trim(),
      date: appointmentDate,
      time: convertTo12Hour(formData.time),
      status: formData.status,
      service: formData.service.trim(),
      reason: formData.reason.trim(),
      description: formData.description.trim()
    };

    console.log('New Appointment:', newAppointment);
    alert('Appointment added successfully!');
    // In React Router: navigate('/appointments');
  };

 const handleAddNewPatient = () => {
  navigate('/add_patient'); // matches your App.js route
};

const handleAddNewService = () => {
  navigate('/add_new_service'); // add this route in App.js if you don't have it yet
};

const handleCancel = () => {
  navigate('/appointments');
};
  return (
    <div className="add-appointment-container">
      <div className="add-appointment-wrapper">
        <div className="add-appointment-card">
          <div className="form-header">
            <div className="header-content">
              <button onClick={handleCancel} className="back-button">
                <ArrowLeft className="back-icon" />
              </button>
              <div>
                <h1 className="form-title">Add New Appointment</h1>
                <p className="form-subtitle">Fill in the details to schedule a new appointment</p>
              </div>
            </div>
          </div>

          <div className="form-body">
            <div className="form-section">
              <label className="form-label">
                <User className="label-icon" />
                Patient Name *
              </label>
              <div className="input-with-button">
                <div className="input-container">
                  <input
                    type="text"
                    value={formData.patient}
                    onChange={(e) => {
                      handlePatientInputChange(e.target.value);
                      if (formErrors.patient) {
                        setFormErrors({...formErrors, patient: ''});
                      }
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className={`form-input ${formErrors.patient ? 'error' : ''}`}
                    placeholder="Start typing patient name..."
                    autoComplete="off"
                  />
                  {formErrors.patient && (
                    <div className="error-message">{formErrors.patient}</div>
                  )}
                  {showPatientDropdown && filteredPatients.length > 0 && (
                    <div className="dropdown-menu">
                      {filteredPatients.map((patient, index) => (
                        <button
                          key={index}
                          onClick={() => handlePatientSelect(patient)}
                          className="dropdown-item"
                        >
                          {patient}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleAddNewPatient} className="add-button add-patient">
                  <Plus className="button-icon" />
                  Add New Patient
                </button>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-section">
                <label className="form-label">
                  <Calendar className="label-icon" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({...formData, date: e.target.value});
                    if (formErrors.date) {
                      setFormErrors({...formErrors, date: ''});
                    }
                  }}
                  className={`form-input ${formErrors.date ? 'error' : ''}`}
                />
                {formErrors.date && (
                  <div className="error-message">{formErrors.date}</div>
                )}
              </div>

              <div className="form-section">
                <label className="form-label">
                  <Clock className="label-icon" />
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => {
                    setFormData({...formData, time: e.target.value});
                    if (formErrors.time) {
                      setFormErrors({...formErrors, time: ''});
                    }
                  }}
                  className={`form-input ${formErrors.time ? 'error' : ''}`}
                />
                {formErrors.time && (
                  <div className="error-message">{formErrors.time}</div>
                )}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Service Name *</label>
              <div className="input-with-button">
                <div className="input-container">
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => {
                      handleServiceInputChange(e.target.value);
                      if (formErrors.service) {
                        setFormErrors({...formErrors, service: ''});
                      }
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    className={`form-input ${formErrors.service ? 'error' : ''}`}
                    placeholder="Select existing or type new service..."
                    autoComplete="off"
                  />
                  {formErrors.service && (
                    <div className="error-message">{formErrors.service}</div>
                  )}
                  {isNewService && formData.service.trim() && (
                    <div className="new-service-indicator">
                      <Plus className="indicator-icon" />
                      New service will be created: <strong>"{formData.service}"</strong>
                    </div>
                  )}
                  {showServiceDropdown && filteredServices.length > 0 && !isNewService && (
                    <div className="dropdown-menu">
                      {filteredServices.map((service, index) => (
                        <button
                          key={index}
                          onClick={() => handleServiceSelect(service)}
                          className="dropdown-item"
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleAddNewService} className="add-button add-service">
                  <Plus className="button-icon" />
                  Add New Service
                </button>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="form-select"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>

            <div className="form-section">
              <label className="form-label">
                <FileText className="label-icon" />
                Reason for Visit *
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => {
                  setFormData({...formData, reason: e.target.value});
                  if (formErrors.reason) {
                    setFormErrors({...formErrors, reason: ''});
                  }
                }}
                className={`form-input ${formErrors.reason ? 'error' : ''}`}
                placeholder="e.g., Routine Check-up, Consultation"
              />
              {formErrors.reason && (
                <div className="error-message">{formErrors.reason}</div>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-textarea"
                rows="4"
                placeholder="Additional notes or details about the appointment"
              />
            </div>
          </div>

          <div className="form-footer">
            <div className="footer-buttons">
              <button onClick={handleCancel} className="btn-cancel">Cancel</button>
              <button onClick={handleSubmit} className="btn-submit">Add Appointment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAppointmentPage;