import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import '../styles/Add_new_bill.css';

export default function AddBillForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const invoice = location.state?.invoice;
  const isEditMode = !!invoice; 
  const [formData, setFormData] = useState({
    id: '',
    patientName: '',
    invoiceNum: '',
    billDate: '',
    services: '',
    totalAmount: '',
    amountPaid: '',
    outstanding: '',
    paymentStatus: 'Unpaid',
    description: '',
    selectedAppointment: ''
  });

  // Appointments data for selection
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Pre-fill form if editing an existing invoice
  useEffect(() => {
    if (invoice) {
      // Convert date format from "Oct 25, 2023" to "2023-10-25"
      const convertDateFormat = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        id: invoice.id || '',
        patientName: invoice.patientName || '',
        invoiceNum: invoice.invoiceNum || '',
        billDate: invoice.date ? convertDateFormat(invoice.date) : '',
        services: invoice.services || '',
        totalAmount: invoice.totalCharge || '',
        amountPaid: invoice.amountPaid || '',
        outstanding: invoice.outstanding || '',
        paymentStatus: invoice.status || 'Unpaid',
        description: '',
        selectedAppointment: ''
      });
    }
  }, [invoice]);

  // Fetch appointments for selection (only for new bills)
  useEffect(() => {
    if (!isEditMode) {
      const fetchAppointments = async () => {
        try {
          setLoadingAppointments(true);
          const response = await fetch('http://localhost:5000/api/appointments');
          if (!response.ok) {
            throw new Error('Failed to fetch appointments');
          }
          const data = await response.json();

          // Filter appointments that don't already have invoices
          const availableAppointments = data.filter(appointment => {
            // In a real app, you'd check against existing invoices
            // For now, we'll just show all appointments
            return appointment.status === 'checked-in'; // Only show completed appointments
          });

          setAppointments(availableAppointments);
        } catch (err) {
          console.error('Error fetching appointments:', err);
          alert('Failed to load appointments. Please try again.');
        } finally {
          setLoadingAppointments(false);
        }
      };

      fetchAppointments();
    }
  }, [isEditMode]);

  const handleSave = async () => {
    try {
      if (isEditMode) {
        // Update existing invoice
        const response = await fetch(`http://localhost:5000/api/invoices/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(formData.totalAmount),
            status: formData.paymentStatus,
            description: formData.description,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update invoice');
        }

        alert('Bill updated successfully!');
      } else {
        // For new bills, create invoice from selected appointment
        if (!formData.selectedAppointment) {
          alert('Please select an appointment first to create an invoice.');
          return;
        }

        const response = await fetch('http://localhost:5000/api/invoices/from-appointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointment_id: formData.selectedAppointment,
            amount: parseFloat(formData.totalAmount),
            description: formData.description,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create invoice');
        }

        const result = await response.json();
        alert('Bill created successfully!');
        console.log('Created invoice:', result);
      }

      // Navigate back to payments page
      navigate('/payments');
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Failed to save bill. Please try again.');
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      // Navigate back to payments page without saving
      navigate('/payments');
    } else {
      // Clear form for add new bill
      setFormData({
        id: '',
        patientName: '',
        invoiceNum: '',
        billDate: '',
        services: '',
        totalAmount: '',
        amountPaid: '',
        outstanding: '',
        paymentStatus: 'Unpaid',
        description: '',
        selectedAppointment: ''
      });
    }
  };

  // Render simple form for adding new bill
  if (!isEditMode) {
    return (
      <div className="bill-form-container">
        <div className="bill-form-card">
          <h1 className="form-title">Add New Bill</h1>

          <div>
            {/* Select Appointment */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Select Appointment
                </label>
                <select
                  value={formData.selectedAppointment}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedAppointment = appointments.find(app => app.appointment_id.toString() === selectedId);
                    setFormData({
                      ...formData,
                      selectedAppointment: selectedId,
                      patientName: selectedAppointment ? selectedAppointment.patientName : '',
                      services: selectedAppointment ? selectedAppointment.service_name : '',
                      billDate: selectedAppointment ? new Date(selectedAppointment.appointment_date).toISOString().split('T')[0] : '',
                      description: selectedAppointment ? `${selectedAppointment.service_name} - ${selectedAppointment.patientName}` : ''
                    });
                  }}
                  className="form-select"
                  disabled={loadingAppointments}
                >
                  <option value="">
                    {loadingAppointments ? 'Loading appointments...' : 'Select an appointment'}
                  </option>
                  {appointments.map((appointment) => (
                    <option key={appointment.appointment_id} value={appointment.appointment_id}>
                      {appointment.patientName} - {appointment.service_name} - {new Date(appointment.appointment_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.selectedAppointment && (
              <>
                <div className="form-row">
                  {/* Patient Name (auto-filled) */}
                  <div className="form-group">
                    <label className="form-label">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={formData.patientName}
                      className="form-input"
                      disabled
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  </div>

                  {/* Service (auto-filled) */}
                  <div className="form-group">
                    <label className="form-label">
                      Service
                    </label>
                    <input
                      type="text"
                      value={formData.services}
                      className="form-input"
                      disabled
                      style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div className="form-row">
                  {/* Bill Date (auto-filled) */}
                  <div className="form-group">
                    <label className="form-label">
                      Bill Date
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="date"
                        value={formData.billDate}
                        onChange={(e) => setFormData({...formData, billDate: e.target.value})}
                        className="form-input"
                        placeholder="mm/dd/yyyy"
                      />
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="form-group">
                    <label className="form-label">
                      Amount
                    </label>
                    <div className="amount-input-wrapper">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                        className="form-input amount-input"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="description-group">
                  <label className="form-label">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="5"
                    className="form-textarea"
                    placeholder="Enter a brief description for the bill..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                  <button
                    onClick={handleCancel}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-save"
                  >
                    Save Bill
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render full detailed form for editing existing bill
  return (
    <div className="bill-form-container">
      <div className="bill-form-card">
        <h1 className="form-title">Edit Bill</h1>
        
        <div>
          {/* Patient Name */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Patient Name
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                className="form-input"
                placeholder="Enter patient name"
              />
            </div>
          </div>

          <div className="form-row">
            {/* Invoice Number */}
            <div className="form-group">
              <label className="form-label">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoiceNum}
                onChange={(e) => setFormData({...formData, invoiceNum: e.target.value})}
                className="form-input"
                placeholder="INV-00000"
                disabled
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
              />
            </div>

            {/* Bill Date */}
            <div className="form-group">
              <label className="form-label">
                Bill Date
              </label>
              <div className="input-wrapper">
                <input
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => setFormData({...formData, billDate: e.target.value})}
                  className="form-input"
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
          </div>

          {/* Services Rendered */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Services Rendered
              </label>
              <input
                type="text"
                value={formData.services}
                onChange={(e) => setFormData({...formData, services: e.target.value})}
                className="form-input"
                placeholder="e.g., Cleaning, X-Ray"
              />
            </div>
          </div>

          <div className="form-row">
            {/* Total Amount */}
            <div className="form-group">
              <label className="form-label">
                Total Amount
              </label>
              <div className="amount-input-wrapper">
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => {
                    const total = parseFloat(e.target.value) || 0;
                    const paid = parseFloat(formData.amountPaid) || 0;
                    setFormData({
                      ...formData, 
                      totalAmount: e.target.value,
                      outstanding: (total - paid).toFixed(2)
                    });
                  }}
                  className="form-input amount-input"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Amount Paid */}
            <div className="form-group">
              <label className="form-label">
                Amount Paid
              </label>
              <div className="amount-input-wrapper">
                <input
                  type="number"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={(e) => {
                    const total = parseFloat(formData.totalAmount) || 0;
                    const paid = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData, 
                      amountPaid: e.target.value,
                      outstanding: (total - paid).toFixed(2)
                    });
                  }}
                  className="form-input amount-input"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            {/* Outstanding Amount (Read-only) */}
            <div className="form-group">
              <label className="form-label">
                Outstanding Amount
              </label>
              <div className="amount-input-wrapper">
                <input
                  type="number"
                  step="0.01"
                  value={formData.outstanding}
                  className="form-input amount-input"
                  placeholder="0.00"
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* Payment Status */}
            <div className="form-group">
              <label className="form-label">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                className="form-select"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="description-group">
            <label className="form-label">
              Description / Notes
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="5"
              className="form-textarea"
              placeholder="Enter additional notes or description for the bill..."
            />
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              onClick={handleCancel}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-save"
            >
              Update Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}