// src/components/AddAppointmentPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    'Olivia White',
  ]);

  const [services] = useState([
    'Routine Check-up',
    'Dental Cleaning',
    'Filling',
    'X-Ray',
    'Blood Test',
    'Consultation',
    'Follow-up',
    'Vaccination',
  ]);

  const [formData, setFormData] = useState({
    patient: '',
    date: '',
    time: '',
    service: '',
    description: '',
    status: 'Pending',
  });

  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [filteredServices, setFilteredServices] = useState(services);
  const [isNewService, setIsNewService] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handlePatientInputChange = (value) => {
    setFormData({ ...formData, patient: value });
    setShowPatientDropdown(true);
    const filtered = patients.filter((patient) =>
      patient.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPatients(filtered);
  };

  const handlePatientSelect = (patient) => {
    setFormData({ ...formData, patient });
    setShowPatientDropdown(false);
  };

  const handleServiceInputChange = (value) => {
    setFormData({ ...formData, service: value });
    setShowServiceDropdown(true);
    setIsNewService(false);
    const filtered = services.filter((service) =>
      service.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredServices(filtered);
    if (filtered.length === 0 && value.trim()) setIsNewService(true);
  };

  const handleServiceSelect = (service) => {
    setFormData({ ...formData, service });
    setShowServiceDropdown(false);
    setIsNewService(false);
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.patient.trim()) {
      errors.patient = 'Please choose a patient';
    }

    if (!formData.date) {
      errors.date = 'Please select a date';
    }

    if (!formData.time) {
      errors.time = 'Please select a time';
    }

    if (!formData.service.trim()) {
      errors.service = 'Please choose a service';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
const handleSubmit = () => {
  if (!validateForm()) return;

  const appointmentDate = new Date(formData.date + 'T00:00:00');

  const newAppointment = {
    id: (Math.random() * 100000).toFixed(0),
    patient: formData.patient.trim(),
    date: appointmentDate,
    time: convertTo12Hour(formData.time),
    status: formData.status,
    // appointments page expects a "reason" field; reuse service as reason
    reason: formData.service.trim(),
    description: formData.description.trim(),
  };

  console.log('New Appointment:', newAppointment);
  alert('Appointment added successfully!');

  // send new appointment back to appointments page via router state
  navigate('/appointments', { state: { newAppointment } });
};

 
  const handleAddNewPatient = () => {
    navigate('/add_patient');
  };

  const handleAddNewService = () => {
    navigate('/add-service');
  };

  const handleCancel = () => {
    navigate('/appointments');
  };

  return (
    <div className="add-appointment-container">
      <div className="add-appointment-wrapper">
        <div className="add-appointment-card">
          {/* Top bar */}
          <div className="simple-header">
            <button onClick={handleCancel} className="simple-back">
              <ArrowLeft className="back-icon" />
            </button>
            <div>
              <h1 className="simple-title">New appointment</h1>
              <p className="simple-subtitle">
                Quick details to schedule this visit.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="simple-body">
            {/* Patient */}
            <section className="simple-section">
              <div className="simple-section-header">
                <div className="section-icon-circle">
                  <User className="section-icon" />
                </div>
                <div>
                  <h2 className="section-title">Patient</h2>
                  <p className="section-hint">
                    Choose an existing patient or add a new one.
                  </p>
                </div>
              </div>

              <div className="input-row">
                <div className="input-container">
                  <input
                    type="text"
                    value={formData.patient}
                    onChange={(e) => {
                      handlePatientInputChange(e.target.value);
                      if (formErrors.patient) {
                        setFormErrors({ ...formErrors, patient: '' });
                      }
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className={`simple-input ${
                      formErrors.patient ? 'error' : ''
                    }`}
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
                <button
                  onClick={handleAddNewPatient}
                  className="chip-button chip-blue"
                >
                  <Plus className="chip-icon" />
                  New patient
                </button>
              </div>
            </section>

            {/* Date & time */}
            <section className="simple-section">
              <div className="simple-section-header">
                <div className="section-icon-circle">
                  <Calendar className="section-icon" />
                </div>
                <div>
                  <h2 className="section-title">Date & time</h2>
                  <p className="section-hint">
                    When will this appointment take place?
                  </p>
                </div>
              </div>

              <div className="simple-grid-2">
                <div>
                  <label className="mini-label">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value });
                      if (formErrors.date) {
                        setFormErrors({ ...formErrors, date: '' });
                      }
                    }}
                    className={`simple-input ${
                      formErrors.date ? 'error' : ''
                    }`}
                  />
                  {formErrors.date && (
                    <div className="error-message">{formErrors.date}</div>
                  )}
                </div>

                <div>
                  <label className="mini-label">
                    <Clock className="mini-icon" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => {
                      setFormData({ ...formData, time: e.target.value });
                      if (formErrors.time) {
                        setFormErrors({ ...formErrors, time: '' });
                      }
                    }}
                    className={`simple-input ${
                      formErrors.time ? 'error' : ''
                    }`}
                  />
                  {formErrors.time && (
                    <div className="error-message">{formErrors.time}</div>
                  )}
                </div>
              </div>
            </section>

            {/* Service */}
            <section className="simple-section">
              <div className="simple-section-header">
                <div className="section-icon-circle">
                  <FileText className="section-icon" />
                </div>
                <div>
                  <h2 className="section-title">Service</h2>
                  <p className="section-hint">
                    Link this appointment to a treatment or category.
                  </p>
                </div>
              </div>

              <div className="input-row">
                <div className="input-container">
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => {
                      handleServiceInputChange(e.target.value);
                      if (formErrors.service) {
                        setFormErrors({ ...formErrors, service: '' });
                      }
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    className={`simple-input ${
                      formErrors.service ? 'error' : ''
                    }`}
                    placeholder="Select existing or type new service..."
                    autoComplete="off"
                  />
                  {formErrors.service && (
                    <div className="error-message">{formErrors.service}</div>
                  )}
                  {isNewService && formData.service.trim() && (
                    <div className="new-service-indicator">
                      <Plus className="indicator-icon" />
                      New service will be created:{' '}
                      <strong>"{formData.service}"</strong>
                    </div>
                  )}
                  {showServiceDropdown &&
                    filteredServices.length > 0 &&
                    !isNewService && (
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
                <button
                  onClick={handleAddNewService}
                  className="chip-button chip-outline"
                >
                  New service
                </button>
              </div>
            </section>

            {/* Notes and status */}
            <section className="simple-section">
              <div className="simple-section-header">
                <div className="section-icon-circle">
                  <Clock className="section-icon" />
                </div>
                <div>
                  <h2 className="section-title">Notes & status</h2>
                  <p className="section-hint">
                    Optional notes and the appointment status.
                  </p>
                </div>
              </div>

              <div className="simple-grid-2">
                <div>
                  <label className="mini-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="simple-input"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>
              </div>

              <div className="notes-block">
                <label className="mini-label">Notes (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="simple-textarea"
                  rows="3"
                  placeholder="Short note for this visit..."
                />
              </div>
            </section>
          </div>

          {/* Bottom buttons */}
          <div className="simple-footer">
            <button onClick={handleCancel} className="simple-btn secondary">
              Cancel
            </button>
            <button onClick={handleSubmit} className="simple-btn primary">
              Save appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAppointmentPage;
