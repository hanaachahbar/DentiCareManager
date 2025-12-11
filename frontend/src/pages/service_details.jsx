// src/pages/service_details.jsx - COMPLETE FILE WITH INVOICE EDIT
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
  
  const API_URL = 'http://localhost:5000/api';
  const queryParams = new URLSearchParams(location.search);
  const serviceId = queryParams.get('serviceId');
  
  const [service, setService] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError('No service ID provided in URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching service details for ID:', serviceId);
        
        const serviceResponse = await axios.get(`${API_URL}/services/${serviceId}`);
        const serviceData = serviceResponse.data.service || serviceResponse.data;
        
        let appointmentsData = [];
        try {
          const appointmentsResponse = await axios.get(`${API_URL}/appointments/service/${serviceId}`);
          appointmentsData = appointmentsResponse.data.appointments || appointmentsResponse.data || [];
        } catch (appointmentsErr) {
          console.log('No appointments found');
        }
        
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
        
        const processedAppointments = await Promise.all(
          appointmentsData.map(async (apt) => {
            try {
              // Get prescription
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
                console.log('No prescription found');
              }

              // Get invoice - UPDATED LOGIC
              let invoice = null;
              try {
                const invoicesResponse = await axios.get(`${API_URL}/invoices`);
                const allInvoices = invoicesResponse.data.invoices || [];
                
                const appointmentInvoice = allInvoices.find(
                  inv => inv.appointment_id === (apt.appointment_id || apt.id)
                );
                
                if (appointmentInvoice) {
                  invoice = {
                    amount: `$${parseFloat(appointmentInvoice.amount).toFixed(2)}`,
                    description: appointmentInvoice.description || '',
                    invoice_id: appointmentInvoice.invoice_id
                  };
                }
              } catch (invoiceErr) {
                console.log('No invoice found for appointment');
              }

              // Get documents
              let files = [];
              try {
                const documentsResponse = await axios.get(`${API_URL}/documents/appointment/${apt.appointment_id || apt.id}`);
                files = (documentsResponse.data.documents || []).map(doc => ({
                  name: doc.path,
                  document_id: doc.document_id
                }));
              } catch (docErr) {
                console.log('No documents found');
              }

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

        const validAppointments = processedAppointments.filter(apt => apt !== null);
        setService(formattedService);
        setAppointments(validAppointments);
        setError('');
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError(`Failed to load service details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  const openAddModal = () => {
    setNewAppointment({
      appointment_date: '',
      appointment_time: '',
      description: '',
      status: 'pending'
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleNewAppointmentChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({ ...prev, [name]: value }));
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

      const createdAppointment = response.data.appointment || response.data;
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
      console.error('Error creating appointment:', err);
      alert(`Failed to create appointment: ${err.message}`);
    }
  };

  const handleAddPrescription = (appointmentId) => {
    navigate(`/prescription_management?appointment_id=${appointmentId}`);
  };

  const handleOpenPrescription = (appointmentId) => {
    navigate(`/prescriptions/${appointmentId}`);
  };

  // BILL MODAL - UPDATED
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
    setBillModal((prev) => ({ ...prev, [name]: value }));
  };

  // SAVE BILL - CREATE OR UPDATE
  const handleSaveBill = async () => {
    if (!billModal.amount || !billModal.appointmentId) {
      alert('Please enter an amount for the invoice.');
      return;
    }

    const invoiceAmount = parseFloat(billModal.amount);
    
    if (invoiceAmount <= 0) {
      alert('Invoice amount must be greater than $0.00');
      return;
    }

    try {
      const existingInvoice = appointments.find(apt => apt.id === billModal.appointmentId)?.invoice;
      const isEditing = existingInvoice && existingInvoice.invoice_id;

      let paymentId;
      let paymentData = null;
      
      try {
        const paymentResponse = await axios.get(`${API_URL}/payments/service/${serviceId}`);
        if (paymentResponse.data && paymentResponse.data.payment) {
          paymentId = paymentResponse.data.payment.payment_id;
          paymentData = paymentResponse.data.payment;
        }
      } catch (paymentErr) {
        console.log('No payment found');
      }

      if (!paymentId && !isEditing) {
        let serviceTotal = invoiceAmount;
        
        try {
          const serviceResponse = await axios.get(`${API_URL}/services/${serviceId}`);
          const serviceData = serviceResponse.data.service || serviceResponse.data;
          
          if (serviceData.total_amount || serviceData.total_cost) {
            serviceTotal = parseFloat(serviceData.total_amount || serviceData.total_cost);
          }
        } catch (serviceErr) {
          console.log('Using invoice amount as payment total');
        }
        
        if (invoiceAmount > serviceTotal) {
          alert(
            `Cannot Create Invoice\n\n` +
            `The invoice amount ($${invoiceAmount.toFixed(2)}) exceeds the total service cost ($${serviceTotal.toFixed(2)}).\n\n` 
          );
          return;
        }
        
        const createPaymentResponse = await axios.post(`${API_URL}/payments`, {
          service_id: serviceId,
          total_amount: serviceTotal,
          description: 'Service payment'
        });
        
        paymentId = createPaymentResponse.data.payment.payment_id;
        paymentData = createPaymentResponse.data.payment;
      }

      if (paymentData) {
        const existingInvoicesResponse = await axios.get(`${API_URL}/invoices/payment/${paymentId}`);
        const existingInvoices = existingInvoicesResponse.data.invoices || [];
        
        const totalAlreadyInvoiced = existingInvoices
          .filter(inv => inv.appointment_id !== billModal.appointmentId)
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        
        const remainingToInvoice = paymentData.total_amount - totalAlreadyInvoiced;
        
        if (invoiceAmount > remainingToInvoice) {
          const excessAmount = invoiceAmount - remainingToInvoice;
          alert(
            `Your requested amountexceeds the remaining balance\n\n` +
            ` Maximum amount: $${remainingToInvoice.toFixed(2)}`
          );
          return;
        }
      }

      let invoiceResponse;

      if (isEditing) {
        invoiceResponse = await axios.put(`${API_URL}/invoices/${existingInvoice.invoice_id}`, {
          amount: invoiceAmount,
          description: billModal.description || ''
        });
      } else {
        invoiceResponse = await axios.post(`${API_URL}/invoices`, {
          payment_id: paymentId,
          appointment_id: billModal.appointmentId,
          amount: invoiceAmount,
          description: billModal.description || ''
        });
      }

      const formattedAmount = `$${invoiceAmount.toFixed(2)}`;

      setAppointments(prev =>
        prev.map((apt) =>
          apt.id === billModal.appointmentId
            ? {
                ...apt,
                invoice: {
                  amount: formattedAmount,
                  description: billModal.description.trim(),
                  invoice_id: invoiceResponse.data.invoice.invoice_id || existingInvoice.invoice_id
                },
              }
            : apt
        )
      );

      if (invoiceResponse.data.payment_update) {
        setService(prev => ({
          ...prev,
          payment_status: invoiceResponse.data.payment_update.status
        }));
      }

      closeBillModal();
      
      const statusEmoji = invoiceResponse.data.payment_update?.status === 'completed' ? '✅' : 
                         invoiceResponse.data.payment_update?.status === 'partially_paid' ? '⏳' : '📋';
      
      alert(
        `${statusEmoji} Invoice ${isEditing ? 'Updated' : 'Created'} Successfully!\n\n` +
        `Amount: $${invoiceAmount.toFixed(2)}\n` +
        `Status: ${invoiceResponse.data.payment_update?.status?.replace('_', ' ').toUpperCase() || 'Updated'}\n` +
        `Remaining Balance: $${invoiceResponse.data.payment_update?.remaining_amount?.toFixed(2) || '0.00'}`
      );
    } catch (err) {
      console.error('Error saving bill:', err);
      
      if (err.response?.data?.error) {
        const errorData = err.response.data;
        
        if (errorData.remaining_to_invoice !== undefined) {
          const excessAmount = (errorData.requested_amount || invoiceAmount) - errorData.remaining_to_invoice;
          alert(
            `❌ Invoice Validation Failed\n\n` +
            `${errorData.error}\n\n` +
            `Payment Total: $${errorData.payment_total?.toFixed(2)}\n` +
            `Currently Invoiced: $${errorData.current_invoiced?.toFixed(2)}\n` +
            `Remaining Available: $${errorData.remaining_to_invoice?.toFixed(2)}\n\n` +
            `You're over by $${excessAmount.toFixed(2)}.\n\n` +
            `💡 Maximum: $${errorData.remaining_to_invoice?.toFixed(2)}`
          );
        } else if (errorData.error.includes('already exists')) {
          alert(
            `⚠️ Invoice Already Exists\n\n` +
            `Use the "Edit bill" button to modify it.`
          );
        } else {
          alert(`❌ Error: ${errorData.error}`);
        }
      } else {
        alert(`❌ Failed to save invoice: ${err.message}`);
      }
    }
  };

  const triggerFilePicker = (appointmentId) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.dataset.appointmentId = appointmentId;
    fileInputRef.current.click();
  };

  const handleFilesSelected = async (event) => {
    const files = Array.from(event.target.files || []);
    const appointmentId = parseInt(event.target.dataset.appointmentId, 10);
    
    if (!appointmentId || files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('documents', file));
      formData.append('appointment_id', appointmentId);

      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newFiles = response.data.documents.map(doc => ({
        name: doc.filename || doc.path,
        document_id: doc.document_id
      }));

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, files: [...(apt.files || []), ...newFiles] }
            : apt
        )
      );

      alert('Files uploaded successfully!');
    } catch (err) {
      console.error('Error uploading files:', err);
      alert(`Failed to upload files: ${err.response?.data?.error || err.message}`);
    }

    event.target.value = '';
  };

  const handleOpenFile = (documentId) => {
    window.open(`${API_URL}/documents/download/${documentId}`, '_blank');
  };

  const handleDeleteFile = async (documentId, appointmentId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`${API_URL}/documents/${documentId}`);
        
        setAppointments(prev =>
          prev.map((apt) =>
            apt.id === appointmentId
              ? { ...apt, files: apt.files.filter(file => file.document_id !== documentId) }
              : apt
          )
        );
        
        alert('File deleted successfully!');
      } catch (err) {
        console.error('Error deleting file:', err);
        alert('Failed to delete file.');
      }
    }
  };

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
        <header className="service-header">
          <div>
            <h1 className="service-title">{service?.service_name || 'Service Details'}</h1>
            <p className="service-subtitle">
              Patient: {service?.patient_name || 'Unknown'}{' '}
              <span className="service-subtitle-id">(ID: {service?.patient_id || 'N/A'})</span>
            </p>
          </div>
          <button className="btn-primary service-add-btn" onClick={openAddModal}>
            + Add appointment
          </button>
        </header>

        <section className="service-description-card">
          <div className="service-desc-header-row">
            <h2 className="section-heading">Service overview</h2>
            {service?.formatted_total_price && (
              <div className="service-price-pill">
                <span className="service-price-label">Total price</span>
                <span className="service-price-value">{service.formatted_total_price}</span>
              </div>
            )}
          </div>
          <p className="service-description-text">{service?.description || 'No description available'}</p>
        </section>

        <section className="appointments-section">
          <h2 className="section-heading">Appointments ({appointments.length})</h2>

          {appointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments found. Add your first appointment!</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <article key={apt.id} className="appointment-card">
                <div className="appointment-top-row">
                  <div>
                    <p className="appointment-date-main">Appointment: {apt.dateLabel} • {apt.time}</p>
                    <p className="appointment-title">{apt.title}</p>
                  </div>
                  <span className="appointment-chip">#{apt.id.toString().padStart(3, '0')}</span>
                </div>

                {apt.notes && apt.notes !== apt.title && (
                  <p className="appointment-notes">{apt.notes}</p>
                )}

                <div className="appointment-columns">
                  <div className="appointment-panel prescription-panel">
                    <div className="panel-header">
                      <span className="panel-title">Prescription</span>
                    </div>
                    {apt.prescription ? (
                      <button className="prescription-card" onClick={() => handleOpenPrescription(apt.id)}>
                        <span className="prescription-name">{apt.prescription.name}</span>
                        <span className="prescription-meta">Prescribed on {apt.prescription.date}</span>
                      </button>
                    ) : (
                      <button className="panel-empty-btn" onClick={() => handleAddPrescription(apt.id)}>
                        + Add prescription
                      </button>
                    )}
                  </div>

                  <div className="appointment-panel files-panel">
                    <div className="panel-header">
                      <span className="panel-title">Files</span>
                      <span className="file-count">({apt.files?.length || 0})</span>
                    </div>
                    {apt.files && apt.files.length > 0 && (
                      <div className="files-list">
                        {apt.files.map((file) => (
                          <div key={file.document_id} className="file-item">
                            <button className="file-pill-large" onClick={() => handleOpenFile(file.document_id)}>
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
                    <button className="panel-empty-btn panel-empty-inline" onClick={() => triggerFilePicker(apt.id)}>
                      + Add file
                    </button>
                  </div>

                  <div className="appointment-panel invoice-panel">
                    <div className="panel-header">
                      <span className="panel-title">Bill</span>
                    </div>
                    {apt.invoice ? (
                      <div className="bill-display-column">
                        <span className="bill-amount">{apt.invoice.amount}</span>
                        {apt.invoice.description && (
                          <span className="bill-description">{apt.invoice.description}</span>
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
                      <button type="button" className="panel-empty-btn" onClick={() => openBillModal(apt.id, null)}>
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

      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFilesSelected}
      />

      {isAddModalOpen && (
        <div className="service-modal-overlay">
          <div className="service-modal-container">
            <div className="service-modal-header">
              <h2 className="service-modal-title">Add new appointment</h2>
              <button className="service-modal-close" onClick={closeAddModal}>×</button>
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
              <button className="service-modal-btn-cancel" onClick={closeAddModal}>Cancel</button>
              <button className="service-modal-btn-create" onClick={handleCreateAppointment}>
                Create appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {billModal.isOpen && (
        <div className="service-modal-overlay">
          <div className="service-modal-container bill-modal-container">
            <div className="service-modal-header">
              <h2 className="service-modal-title">Bill for appointment</h2>
              <button className="service-modal-close" onClick={closeBillModal}>×</button>
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
                  <label className="service-modal-label">Description (optional)</label>
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
              <button className="service-modal-btn-cancel" onClick={closeBillModal}>Cancel</button>
              <button className="service-modal-btn-create" onClick={handleSaveBill}>Save bill</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;