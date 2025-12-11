// src/pages/service_details.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/service_details.css';
import axios from 'axios';

const ServiceDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [billModal, setBillModal] = useState({
    isOpen: false,
    appointmentId: null,
    amount: '',
    description: '',
  });
  const fileInputRef = useRef(null);
  
  // API base URL
  const API_URL = 'http://localhost:5000/api';

  // Get serviceId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const serviceId = queryParams.get('serviceId');
  
  // State for service and appointments
  const [service, setService] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    appointment_date: '',
    appointment_time: '',
    description: '',
    status: 'pending'
  });

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!serviceId) {
        setError('No service ID provided in URL. Please access this page with ?serviceId= parameter.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching service details for ID:', serviceId);
        
        // Fetch service info
        const serviceResponse = await axios.get(`${API_URL}/services/${serviceId}`);
        console.log('Service response:', serviceResponse.data);
        
        if (!serviceResponse.data) {
          throw new Error('No service data returned');
        }
        
        const serviceData = serviceResponse.data.service || serviceResponse.data;
        console.log('Service data:', serviceData);
        
        // Fetch appointments for this service
        let appointmentsData = [];
        try {
          const appointmentsResponse = await axios.get(`${API_URL}/appointments/service/${serviceId}`);
          console.log('Appointments response:', appointmentsResponse.data);
          appointmentsData = appointmentsResponse.data.appointments || appointmentsResponse.data || [];
        } catch (appointmentsErr) {
          console.log('No appointments found or error:', appointmentsErr.message);
        }
        
        // Format service data - check what fields are actually available
        const formattedService = {
          service_id: serviceData.service_id,
          service_name: serviceData.service_name || 'Service',
          patient_name: `${serviceData.first_name || ''} ${serviceData.last_name || ''}`.trim() || 'Unknown Patient',
          patient_id: serviceData.patient_id,
          description: serviceData.description || `Treatment for ${serviceData.first_name || ''} ${serviceData.last_name || ''}`,
          total_price: serviceData.total_amount || serviceData.total_cost || 0,
          formatted_total_price: (serviceData.total_amount || serviceData.total_cost) ? 
            `$${parseFloat(serviceData.total_amount || serviceData.total_cost || 0).toFixed(2)}` : '$0.00',
          payment_status: serviceData.payment_status || 'unpaid'
        };
        
        console.log('Formatted service:', formattedService);
        
        // Process each appointment to get related data
        const processedAppointments = await Promise.all(
          appointmentsData.map(async (apt) => {
            try {
              console.log('Processing appointment:', apt);
              
              // Get prescription for this appointment
              let prescription = null;
              try {
                const prescriptionResponse = await axios.get(`${API_URL}/appointments/${apt.appointment_id || apt.id}`);
                const prescriptionData = prescriptionResponse.data.prescriptions || [];
                if (prescriptionData.length > 0) {
                  prescription = {
                    name: prescriptionData[0].medication_name || 'Prescription',
                    date: new Date(apt.appointment_date || apt.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  };
                }
              } catch (prescErr) {
                console.log('No prescription found for appointment', apt.appointment_id || apt.id);
              }

              // Get invoice for this appointment
              let invoice = null;
              try {
                // Check if appointment has invoice data
                if (apt.invoice) {
                  invoice = {
                    amount: `$${parseFloat(apt.invoice.amount).toFixed(2)}`,
                    description: apt.invoice.description || 'Appointment fee',
                    invoice_id: apt.invoice.invoice_id
                  };
                }
              } catch (invoiceErr) {
                console.log('No invoice found for appointment', apt.appointment_id || apt.id);
              }

              // Get documents for this appointment
              let files = [];
              try {
                const documentsResponse = await axios.get(`${API_URL}/documents/appointment/${apt.appointment_id || apt.id}`);
                files = (documentsResponse.data.documents || []).map(doc => ({
                  name: doc.path,
                  document_id: doc.document_id
                }));
              } catch (docErr) {
                console.log('No documents found for appointment', apt.appointment_id || apt.id);
              }

              // Format appointment date
              const appointmentDate = apt.appointment_date || apt.date || new Date().toISOString().split('T')[0];
              const formattedDate = new Date(appointmentDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return {
                id: apt.appointment_id || apt.id,
                dateLabel: formattedDate,
                time: apt.appointment_time || apt.time || '10:00',
                title: apt.description || apt.title || 'Appointment',
                notes: apt.description || apt.notes || '',
                status: apt.status || 'pending',
                prescription: prescription,
                invoice: invoice,
                files: files
              };
            } catch (error) {
              console.error('Error processing appointment:', error);
              return null;
            }
          })
        );

        // Filter out null appointments
        const validAppointments = processedAppointments.filter(apt => apt !== null);
        console.log('Valid appointments:', validAppointments);

        setService(formattedService);
        setAppointments(validAppointments);
        setError('');
      } catch (err) {
        console.error('Error fetching service details:', err.response?.data || err.message);
        setError(`Failed to load service details: ${err.response?.data?.error || err.message}`);
        
        // Use fallback data for development
        console.log('Using fallback data...');
        const fallbackService = {
          service_id: serviceId,
          service_name: 'Dental Treatment',
          patient_name: 'Jane Doe',
          patient_id: 'PT12345',
          description: 'Dental treatment plan',
          total_price: 750,
          formatted_total_price: '$750.00',
          payment_status: 'partially_paid'
        };
        
        const fallbackAppointments = [
          {
            id: 1,
            dateLabel: '12 Aug 2023',
            time: '10:00',
            title: 'Initial consultation',
            notes: 'Initial examination and treatment planning',
            status: 'checked-in',
            prescription: null,
            invoice: null,
            files: []
          }
        ];
        
        setService(fallbackService);
        setAppointments(fallbackAppointments);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  // Handler functions
  const openAddModal = () => {
    setNewAppointment({
      appointment_date: '',
      appointment_time: '',
      description: '',
      status: 'pending'
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

  const handleCreateAppointment = async () => {
    if (!newAppointment.appointment_date || !newAppointment.description) {
      alert('Please fill date and description.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/appointments`, {
        service_id: serviceId,
        appointment_date: newAppointment.appointment_date,
        appointment_time: newAppointment.appointment_time || '10:00',
        description: newAppointment.description,
        status: newAppointment.status
      });

      console.log('Appointment created:', response.data);
      
      const createdAppointment = response.data.appointment || response.data;
      
      // Format the new appointment for frontend
      const formattedDate = new Date(createdAppointment.appointment_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const formattedAppointment = {
        id: createdAppointment.appointment_id || createdAppointment.id,
        dateLabel: formattedDate,
        time: createdAppointment.appointment_time || '10:00',
        title: createdAppointment.description,
        notes: createdAppointment.description,
        status: createdAppointment.status || 'pending',
        prescription: null,
        invoice: null,
        files: [],
      };

      setAppointments(prev => [formattedAppointment, ...prev]);
      setIsAddModalOpen(false);
      
      alert('Appointment created successfully!');
    } catch (err) {
      console.error('Error creating appointment:', err.response?.data || err.message);
      alert(`Failed to create appointment: ${err.response?.data?.error || err.message}`);
    }
  };

  // Prescription navigation
  const handleAddPrescription = (appointmentId) => {
    navigate(`/prescription_management?appointment_id=${appointmentId}`);
  };

  const handleOpenPrescription = (appointmentId) => {
    navigate(`/prescriptions/${appointmentId}`);
  };

  // BILL POPUP LOGIC
  const openBillModal = (appointmentId, existingInvoice) => {
    setBillModal({
      isOpen: true,
      appointmentId,
      amount: existingInvoice?.amount ? existingInvoice.amount.replace(/[^0-9.]/g, '') : '',
      description: existingInvoice?.description || '',
    });
  };

  const closeBillModal = () => {
    setBillModal({
      isOpen: false,
      appointmentId: null,
      amount: '',
      description: '',
    });
  };

  const handleBillChange = (e) => {
    const { name, value } = e.target;
    setBillModal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveBill = async () => {
    if (!billModal.amount || !billModal.appointmentId) {
      alert('Please enter an amount.');
      return;
    }

    try {
      // First, check if payment exists for this service
      let paymentId;
      try {
        const paymentResponse = await axios.get(`${API_URL}/payments/service/${serviceId}`);
        console.log('Payment response:', paymentResponse.data);
        if (paymentResponse.data && paymentResponse.data.payment) {
          paymentId = paymentResponse.data.payment.payment_id;
        }
      } catch (paymentErr) {
        console.log('No payment found, will create one:', paymentErr.message);
      }

      // Create payment if it doesn't exist
      if (!paymentId) {
        console.log('Creating new payment...');
        // Get current service total or use bill amount
        let serviceTotal = parseFloat(billModal.amount);
        try {
          const serviceResponse = await axios.get(`${API_URL}/services/${serviceId}`);
          const serviceData = serviceResponse.data.service || serviceResponse.data;
          serviceTotal = parseFloat(serviceData.total_amount || serviceData.total_cost || billModal.amount);
        } catch (serviceErr) {
          console.log('Could not fetch service, using bill amount');
        }
        
        const createPaymentResponse = await axios.post(`${API_URL}/payments`, {
          service_id: serviceId,
          total_amount: serviceTotal,
          description: billModal.description || 'Appointment invoice'
        });
        console.log('Payment created:', createPaymentResponse.data);
        paymentId = createPaymentResponse.data.payment.payment_id;
      }

      // Create invoice
      console.log('Creating invoice with payment ID:', paymentId);
      const invoiceResponse = await axios.post(`${API_URL}/invoices`, {
        payment_id: paymentId,
        appointment_id: billModal.appointmentId,
        amount: parseFloat(billModal.amount),
        description: billModal.description || ''
      });

      console.log('Invoice created:', invoiceResponse.data);

      const formattedAmount = `$${parseFloat(billModal.amount).toFixed(2)}`;

      // Update appointments state
      setAppointments(prev =>
        prev.map((apt) =>
          apt.id === billModal.appointmentId
            ? {
                ...apt,
                invoice: {
                  amount: formattedAmount,
                  description: billModal.description.trim(),
                  invoice_id: invoiceResponse.data.invoice.invoice_id
                },
              }
            : apt
        )
      );

      closeBillModal();
      alert('Invoice created successfully!');
    } catch (err) {
      console.error('Error saving bill:', err.response?.data || err.message);
      alert(`Failed to save invoice: ${err.response?.data?.error || err.message}`);
    }
  };

  // Files
  const triggerFilePicker = (appointmentId) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.dataset.appointmentId = appointmentId;
    fileInputRef.current.click();
  };

  // const handleFilesSelected = async (event) => {
  //   const files = Array.from(event.target.files || []);
  //   const appointmentId = parseInt(event.target.dataset.appointmentId, 10);
    
  //   if (!appointmentId || files.length === 0) return;

  //   try {
  //     const formData = new FormData();
  //     files.forEach(file => {
  //       formData.append('documents', file);
  //     });
  //     formData.append('appointment_id', appointmentId);

  //     const response = await axios.post(`${API_URL}/documents/upload`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     });

  //     console.log('Files uploaded:', response.data);

  //     // Update appointments with new files
  //     const newFiles = response.data.documents.map(doc => ({
  //       name: doc.filename || doc.path,
  //       document_id: doc.document_id
  //     }));

  //     setAppointments(prev =>
  //       prev.map((apt) =>
  //         apt.id === appointmentId
  //           ? {
  //               ...apt,
  //               files: [...(apt.files || []), ...newFiles],
  //             }
  //           : apt
  //       )
  //     );

  //     alert('Files uploaded successfully!');
  //   } catch (err) {
  //     console.error('Error uploading files:', err.response?.data || err.message);
  //     alert(`Failed to upload files: ${err.response?.data?.error || err.message}`);
  //   }

  //   event.target.value = '';
  // };

  const handleFilesSelected = async (event) => {
  const files = Array.from(event.target.files || []);
  const appointmentId = parseInt(event.target.dataset.appointmentId, 10);
  
  if (!appointmentId || files.length === 0) return;

  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file); // Make sure this matches the Multer field name
    });
    formData.append('appointment_id', appointmentId);

    console.log('Uploading files:', files.map(f => f.name));
    console.log('To appointment:', appointmentId);
    console.log('Endpoint:', `${API_URL}/documents/upload`);

    const response = await axios.post(`${API_URL}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Files uploaded:', response.data);

    // Update appointments with new files
    const newFiles = response.data.documents.map(doc => ({
      name: doc.filename || doc.path,
      document_id: doc.document_id
    }));

    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? {
              ...apt,
              files: [...(apt.files || []), ...newFiles],
            }
          : apt
      )
    );

    alert('Files uploaded successfully!');
  } catch (err) {
    console.error('Error uploading files:', err);
    console.error('Error response:', err.response?.data);
    console.error('Error status:', err.response?.status);
    console.error('Error headers:', err.response?.headers);
    
    if (err.response?.status === 404) {
      alert(`Endpoint not found. Please check if the backend is running and the endpoint ${API_URL}/documents/upload exists.`);
    } else {
      alert(`Failed to upload files: ${err.response?.data?.error || err.message}`);
    }
  }

  event.target.value = '';
};

  const handleOpenFile = (documentId, fileName) => {
    window.open(`${API_URL}/documents/download/${documentId}`, '_blank');
  };

  const handleDeleteFile = async (documentId, appointmentId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`${API_URL}/documents/${documentId}`);
        
        setAppointments(prev =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? {
                  ...apt,
                  files: apt.files.filter(file => file.document_id !== documentId),
                }
              : apt
          )
        );
        
        alert('File deleted successfully!');
      } catch (err) {
        console.error('Error deleting file:', err);
        alert('Failed to delete file. Please try again.');
      }
    }
  };

  // Add debug logging for rendering
  console.log('Rendering with state:', { loading, error, service, appointments, serviceId });

  if (loading) {
    return (
      <div className="service-page-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="service-page-container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-page-container">
      <div className="service-page-wrapper">
        {/* Header */}
        <header className="service-header">
          <div>
            <h1 className="service-title">{service?.service_name || 'Service Details'}</h1>
            <p className="service-subtitle">
              Patient: {service?.patient_name || 'Unknown'}{' '}
              <span className="service-subtitle-id">
                (ID: {service?.patient_id || 'N/A'})
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
            {service?.formatted_total_price && (
              <div className="service-price-pill">
                <span className="service-price-label">Total price</span>
                <span className="service-price-value">
                  {service.formatted_total_price}
                </span>
              </div>
            )}
          </div>
          <p className="service-description-text">{service?.description || 'No description available'}</p>
        </section>

        {/* Appointments */}
        <section className="appointments-section">
          <h2 className="section-heading">Appointments ({appointments.length})</h2>

          {appointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments found. Add your first appointment!</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <article key={apt.id} className="appointment-card">
                {/* Top row */}
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

                {apt.notes && apt.notes !== apt.title && (
                  <p className="appointment-notes">{apt.notes}</p>
                )}

                <div className="appointment-columns">
                  {/* Prescription */}
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

                  {/* Files */}
                  <div className="appointment-panel files-panel">
                    <div className="panel-header">
                      <span className="panel-title">Files</span>
                      <span className="file-count">({apt.files?.length || 0})</span>
                    </div>

                    {apt.files && apt.files.length > 0 && (
                      <div className="files-list">
                        {apt.files.map((file) => (
                          <div key={file.document_id} className="file-item">
                            <button
                              className="file-pill-large"
                              onClick={() => handleOpenFile(file.document_id, file.name)}
                            >
                              <span className="file-pill-name">{file.name}</span>
                              <span className="file-pill-meta">View</span>
                            </button>
                            <button
                              className="file-delete-btn"
                              onClick={() => handleDeleteFile(file.document_id, apt.id)}
                              title="Delete file"
                            >
                              ×
                            </button>
                          </div>
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

                  {/* Bill */}
                  <div className="appointment-panel invoice-panel">
                    <div className="panel-header">
                      <span className="panel-title">Bill</span>
                    </div>

                    {apt.invoice ? (
                      <div className="bill-display-column">
                        <span className="bill-amount">
                          {apt.invoice.amount}
                        </span>
                        {apt.invoice.description && (
                          <span className="bill-description">
                            {apt.invoice.description}
                          </span>
                        )}
                        <button
                          type="button"
                          className="panel-empty-btn bill-edit-btn"
                          onClick={() => openBillModal(apt.id, apt.invoice)}
                        >
                          Edit bill
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="panel-empty-btn"
                        onClick={() => openBillModal(apt.id, null)}
                      >
                        + Add bill
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
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
                    name="appointment_date"
                    value={newAppointment.appointment_date}
                    onChange={handleNewAppointmentChange}
                    className="service-modal-input"
                  />
                </div>

                <div className="service-modal-group">
                  <label className="service-modal-label">Time</label>
                  <input
                    type="time"
                    name="appointment_time"
                    value={newAppointment.appointment_time}
                    onChange={handleNewAppointmentChange}
                    className="service-modal-input"
                  />
                </div>

                <div className="service-modal-group service-modal-group-full">
                  <label className="service-modal-label">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={newAppointment.description}
                    onChange={handleNewAppointmentChange}
                    className="service-modal-input"
                    placeholder="e.g., Follow-up consultation"
                  />
                </div>

                <div className="service-modal-group service-modal-group-full">
                  <label className="service-modal-label">Status</label>
                  <select
                    name="status"
                    value={newAppointment.status}
                    onChange={handleNewAppointmentChange}
                    className="service-modal-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="checked-in">Checked-in</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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

      {/* Add / Edit Bill Modal */}
      {billModal.isOpen && (
        <div className="service-modal-overlay">
          <div className="service-modal-container bill-modal-container">
            <div className="service-modal-header">
              <h2 className="service-modal-title">Bill for appointment</h2>
              <button
                className="service-modal-close"
                onClick={closeBillModal}
              >
                ×
              </button>
            </div>

            <div className="service-modal-body">
              <div className="bill-modal-grid">
                <div className="service-modal-group">
                  <label className="service-modal-label">Amount</label>
                  <div className="bill-amount-wrapper">
                    <span className="bill-amount-prefix">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="amount"
                      value={billModal.amount}
                      onChange={handleBillChange}
                      className="service-modal-input bill-amount-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="service-modal-group bill-notes-group">
                  <label className="service-modal-label">
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    value={billModal.description}
                    onChange={handleBillChange}
                    rows="3"
                    className="service-modal-textarea"
                    placeholder="Short note about this invoice..."
                  />
                </div>
              </div>
            </div>

            <div className="service-modal-footer">
              <button
                className="service-modal-btn-cancel"
                onClick={closeBillModal}
              >
                Cancel
              </button>
              <button
                className="service-modal-btn-create"
                onClick={handleSaveBill}
              >
                Save bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;