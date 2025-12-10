// src/components/ServiceDetails.jsx
import React, { useRef, useState } from 'react';
import '../styles/service_details.css';

const ServiceDetails = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const service = {
    name: 'ODF - Orthodontic Treatments',
    patientName: 'Jane Doe',
    patientId: 'PT35-87654',
    description:
      'Orthodontic treatment plan focused on alignment and bite correction. Includes periodic reviews and adjustments.',
    totalPrice: '$750',
  };

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      dateLabel: '12 Aug 2023',
      time: '10:00',
      title: 'Braces adjustment',
      notes: 'Tightening and bracket inspection.',
      prescription: {
        name: 'Prescription 1',
        date: '12 Aug 2023',
      },
      invoice: {
        amount: '$75',
      },
      files: [
        { name: 'Progress_Photo_12_Aug.jpg' },
        { name: 'Adjustment_Report.pdf' },
      ],
    },
    {
      id: 2,
      dateLabel: '05 Jun 2023',
      time: '15:30',
      title: 'Initial consultation',
      notes: 'Baseline photos and full assessment.',
      prescription: null,
      invoice: null,
      files: [],
    },
  ]);

  const [newAppointment, setNewAppointment] = useState({
    dateLabel: '',
    time: '',
    title: '',
    notes: '',
  });

  const openAddModal = () => {
    setNewAppointment({
      dateLabel: '',
      time: '',
      title: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleNewAppointmentChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateAppointment = () => {
    if (!newAppointment.dateLabel || !newAppointment.time || !newAppointment.title) {
      alert('Please fill date, time and title.');
      return;
    }

    const nextId =
      appointments.length > 0
        ? Math.max(...appointments.map((a) => a.id)) + 1
        : 1;

    const created = {
      id: nextId,
      dateLabel: newAppointment.dateLabel,
      time: newAppointment.time,
      title: newAppointment.title,
      notes: newAppointment.notes,
      prescription: null,
      invoice: null,
      files: [],
    };

    setAppointments((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
  };

  // Navigation to other pages
  const handleAddPrescription = () => {
    window.location.href = `/prescription_management`;
  };

  const handleAddBill = () => {
    window.location.href = `/add_bill`;
  };

  // File handling: open picker and append selected files
  const triggerFilePicker = (appointmentId) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.dataset.appointmentId = appointmentId;
    fileInputRef.current.click();
  };

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    const aptId = parseInt(event.target.dataset.appointmentId, 10);
    if (!aptId || files.length === 0) return;

    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === aptId
          ? {
              ...apt,
              files: [
                ...apt.files,
                ...files.map((f) => ({ name: f.name })),
              ],
            }
          : apt
      )
    );

    event.target.value = '';
  };

  const handleOpenPrescription = (appointmentId) => {
    console.log('Open prescription for appointment', appointmentId);
  };

  const handleOpenFile = (appointmentId, fileName) => {
    console.log('Open file', fileName, 'for appointment', appointmentId);
  };

  return (
    <div className="service-page-container">
      <div className="service-page-wrapper">
        {/* Header */}
        <header className="service-header">
          <div>
            <h1 className="service-title">{service.name}</h1>
            <p className="service-subtitle">
              Patient: {service.patientName}{' '}
              <span className="service-subtitle-id">
                (ID: {service.patientId})
              </span>
            </p>
          </div>
          <button
            className="btn-primary service-add-btn"
            onClick={openAddModal}
          >
            + Add appointment
          </button>
        </header>

        {/* Description + total price */}
        <section className="service-description-card">
          <div className="service-desc-header-row">
            <h2 className="section-heading">Service overview</h2>
            {service.totalPrice && (
              <div className="service-price-pill">
                <span className="service-price-label">Total price</span>
                <span className="service-price-value">
                  {service.totalPrice}
                </span>
              </div>
            )}
          </div>
          <p className="service-description-text">{service.description}</p>
        </section>

        {/* Appointments */}
        <section className="appointments-section">
          <h2 className="section-heading">Appointments</h2>

          {appointments.map((apt) => (
            <article key={apt.id} className="appointment-card">
              {/* Top row: date + time + id */}
              <div className="appointment-top-row">
                <div>
                  <p className="appointment-date-main">
                    Appointment: {apt.dateLabel} • {apt.time}
                  </p>
                  <p className="appointment-title">{apt.title}</p>
                </div>
                <span className="appointment-chip">
                  #{apt.id.toString().padStart(3, '0')}
                </span>
              </div>

              {apt.notes && (
                <p className="appointment-notes">{apt.notes}</p>
              )}

              <div className="appointment-columns">
                {/* 1) Prescription first */}
                <div className="appointment-panel prescription-panel">
                  <div className="panel-header">
                    <span className="panel-title">Prescription</span>
                  </div>

                  {apt.prescription ? (
                    <button
                      className="prescription-card"
                      onClick={() => handleOpenPrescription(apt.id)}
                    >
                      <span className="prescription-name">
                        {apt.prescription.name}
                      </span>
                      <span className="prescription-meta">
                        Prescribed on {apt.prescription.date}
                      </span>
                    </button>
                  ) : (
                    <button
                      className="panel-empty-btn"
                      onClick={() => handleAddPrescription(apt.id)}
                    >
                      + Add prescription
                    </button>
                  )}
                </div>

                {/* 2) Files second */}
                <div className="appointment-panel files-panel">
                  <div className="panel-header">
                    <span className="panel-title">Files</span>
                  </div>

                  {apt.files && apt.files.length > 0 && (
                    <div className="files-list">
                      {apt.files.map((file, index) => (
                        <button
                          key={index}
                          className="file-pill-large"
                          onClick={() =>
                            handleOpenFile(apt.id, file.name)
                          }
                        >
                          <span className="file-pill-name">{file.name}</span>
                          <span className="file-pill-meta">View</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    className="panel-empty-btn panel-empty-inline"
                    onClick={() => triggerFilePicker(apt.id)}
                  >
                    + Add file
                  </button>
                </div>

                {/* 3) Bill last – only amount or add bill */}
                <div className="appointment-panel invoice-panel">
                  <div className="panel-header">
                    <span className="panel-title">Bill</span>
                  </div>

                  {apt.invoice ? (
                    <div className="bill-display">
                      <span className="bill-amount">
                        {apt.invoice.amount}
                      </span>
                    </div>
                  ) : (
                    <button
                      className="panel-empty-btn"
                      onClick={() => handleAddBill(apt.id)}
                    >
                      + Add bill
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* Hidden input for file picker */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFilesSelected}
      />

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="service-modal-overlay">
          <div className="service-modal-container">
            <div className="service-modal-header">
              <h2 className="service-modal-title">Add new appointment</h2>
              <button
                className="service-modal-close"
                onClick={closeAddModal}
              >
                ×
              </button>
            </div>

            <div className="service-modal-body">
              <div className="service-modal-grid">
                <div className="service-modal-group">
                  <label className="service-modal-label">Date</label>
                  <input
                    type="date"
                    name="dateLabel"
                    value={newAppointment.dateLabel}
                    onChange={handleNewAppointmentChange}
                    className="service-modal-input"
                  />
                </div>

                <div className="service-modal-group">
                  <label className="service-modal-label">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={newAppointment.time}
                    onChange={handleNewAppointmentChange}
                    className="service-modal-input"
                  />
                </div>

                <div className="service-modal-group service-modal-group-full">
                  <label className="service-modal-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newAppointment.title}
                    onChange={handleNewAppointmentChange}
                    className="service-modal-input"
                    placeholder="e.g., Follow-up consultation"
                  />
                </div>

                <div className="service-modal-group service-modal-group-full">
                  <label className="service-modal-label">
                    Description / notes
                  </label>
                  <textarea
                    name="notes"
                    value={newAppointment.notes}
                    onChange={handleNewAppointmentChange}
                    rows="3"
                    className="service-modal-textarea"
                    placeholder="Add any details about this appointment..."
                  />
                </div>
              </div>
            </div>

            <div className="service-modal-footer">
              <button
                className="service-modal-btn-cancel"
                onClick={closeAddModal}
              >
                Cancel
              </button>
              <button
                className="service-modal-btn-create"
                onClick={handleCreateAppointment}
              >
                Create appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;
