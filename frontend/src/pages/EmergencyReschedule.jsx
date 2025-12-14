import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, AlertTriangle, Edit2, Trash2, Search, Loader } from 'lucide-react';
import '../styles/EmergencyReschedule.css';

// Adjust this to match YOUR backend server port
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const EmergencyReschedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkDate, setBulkDate] = useState('');
  const [bulkDuration, setBulkDuration] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAppointments, setEditingAppointments] = useState({});

  // Fetch all appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching from:', `${API_BASE_URL}/appointments`);
      const response = await fetch(`${API_BASE_URL}/appointments`);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend data to frontend format
      const transformedAppointments = data.appointments.map(apt => ({
        id: apt.appointment_id.toString(),
        patient: `${apt.first_name} ${apt.last_name}`,
        originalDate: apt.appointment_date,
        originalTime: formatTimeFromBackend(apt.appointment_time),
        newDate: apt.appointment_date,
        newTime: apt.appointment_time || '09:00',
        status: capitalizeStatus(apt.status),
        reason: apt.description || 'Not specified',
        isEditing: false,
        patientId: apt.patient_id,
        serviceId: apt.service_id,
        serviceName: apt.service_name
      }));
      
      setAppointments(transformedAppointments);
      setAllAppointments(transformedAppointments);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format time from backend (24-hour) to display (12-hour)
  const formatTimeFromBackend = (time24) => {
    if (!time24) return '09:00 AM';
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Helper function to capitalize status
  const capitalizeStatus = (status) => {
    if (!status) return 'Pending';
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('-');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatOriginalDateTime = (date, time) => {
    return `${formatDate(date)}, ${time}`;
  };

  const handleDateChange = (id, newDate) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, newDate } : apt
    ));
  };

  const handleTimeChange = (id, newTime) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, newTime } : apt
    ));
  };

  const toggleEdit = async (id) => {
    const appointment = appointments.find(apt => apt.id === id);
    
    // If currently editing, save the changes
    if (appointment.isEditing) {
      await saveAppointmentChanges(appointment);
    }
    
    // Toggle edit mode
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, isEditing: !apt.isEditing } : apt
    ));
  };

  const saveAppointmentChanges = async (appointment) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_date: appointment.newDate,
          appointment_time: appointment.newTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      const data = await response.json();
      showSuccess('Appointment updated successfully');
      
      // Refresh appointments list
      await fetchAppointments();
    } catch (err) {
      setError(err.message);
      console.error('Error updating appointment:', err);
    }
  };

  const handleBulkReschedule = async () => {
    if (!bulkDate || !bulkDuration) {
      alert('Please fill in both date and duration for bulk reschedule');
      return;
    }

    const hours = parseInt(bulkDuration);
    if (isNaN(hours)) {
      alert('Duration must be a number');
      return;
    }

    try {
      setLoading(true);
      
      const url = `${API_BASE_URL}/appointments/bulk-reschedule`;
      console.log('Bulk reschedule URL:', url);
      console.log('Request body:', {
        original_date: bulkDate,
        new_date: bulkDate,
        hours_offset: hours,
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_date: bulkDate,
          new_date: bulkDate,
          hours_offset: hours,
        }),
      });

      console.log('Bulk reschedule response status:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to bulk reschedule');
        } catch (e) {
          throw new Error(`Failed to bulk reschedule: ${response.status} - ${text.substring(0, 100)}`);
        }
      }

      const data = await response.json();
      showSuccess(`Successfully rescheduled ${data.count} appointment(s)`);
      
      // Refresh appointments list
      await fetchAppointments();
      
      // Reset bulk reschedule fields
      setBulkDate('');
      setBulkDuration('');
    } catch (err) {
      alert(err.message);
      console.error('Error bulk rescheduling:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      showSuccess('Appointment deleted successfully');
      
      // Remove from local state
      const updatedAppointments = appointments.filter(apt => apt.id !== appointmentToDelete.id);
      setAppointments(updatedAppointments);
      setAllAppointments(updatedAppointments);
      
      setShowDeleteConfirm(false);
      setAppointmentToDelete(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting appointment:', err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAppointmentToDelete(null);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setAppointments(allAppointments);
    } else {
      const filtered = allAppointments.filter(apt => {
        const searchLower = value.toLowerCase();
        const patientMatch = apt.patient.toLowerCase().includes(searchLower);
        const dateMatch = apt.originalDate.includes(value);
        const formattedDate = formatDate(apt.originalDate).toLowerCase().includes(searchLower);
        
        return patientMatch || dateMatch || formattedDate;
      });
      setAppointments(filtered);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleSaveChanges = async () => {
    // Save all appointments that are currently in edit mode
    const editingApts = appointments.filter(apt => apt.isEditing);
    
    if (editingApts.length === 0) {
      showSuccess('No changes to save');
      return;
    }

    try {
      setLoading(true);
      
      // Save each appointment
      for (const apt of editingApts) {
        await saveAppointmentChanges(apt);
      }
      
      showSuccess(`Successfully saved ${editingApts.length} appointment(s)`);
      
      // Turn off edit mode for all
      setAppointments(appointments.map(apt => ({ ...apt, isEditing: false })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="container">
        <div className="content-wrapper">
          <div className="loading-state">
            <Loader className="spinner" size={48} />
            <p>Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="header-left">
              <a href="/" className="back-button">
                <ArrowLeft size={24} />
              </a>
              <div>
                <h1 className="main-title">Emergency Reschedule</h1>
                <p className="subtitle">Modify and reschedule appointments.</p>
              </div>
            </div>
            <button onClick={handleSaveChanges} className="save-button" disabled={loading}>
              <Calendar size={20} />
              Save Changes
            </button>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="success-message">
              <Calendar size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Bulk Reschedule */}
          <div className="bulk-reschedule-section">
            <div className="bulk-header">
              <AlertTriangle className="alert-icon" size={20} />
              <div className="bulk-text">
                <h3 className="bulk-title">Bulk Reschedule</h3>
                <p className="bulk-description">
                  Select a date and specify hours to reschedule all appointments from that date.
                </p>
              </div>
            </div>
            
            <div className="bulk-inputs">
              <div className="input-group">
                <input
                  type="date"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                  className="date-input"
                  placeholder="Select date"
                />
              </div>
              <div className="input-group">
                <input
                  type="number"
                  value={bulkDuration}
                  onChange={(e) => setBulkDuration(e.target.value)}
                  className="duration-input"
                  placeholder="Hours (e.g., 2)"
                />
              </div>
              <button 
                onClick={handleBulkReschedule} 
                className="apply-button"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-card">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by patient name or date..."
              className="search-input"
            />
          </div>
          {searchTerm && (
            <p className="search-results">
              Found {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Appointments Table */}
        <div className="table-card">
          <div className="table-wrapper">
            <table className="appointments-table">
              <thead className="table-header">
                <tr>
                  <th className="th-patient">PATIENT</th>
                  <th className="th-original">ORIGINAL DATE & TIME</th>
                  <th className="th-new">NEW DATE & TIME</th>
                  <th className="th-status">STATUS</th>
                  <th className="th-reason">REASON FOR VISIT</th>
                  <th className="th-actions">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                  <tr key={apt.id} className="table-row">
                    <td className="td-content">
                      <span className={apt.status === 'Cancelled' ? 'cancelled-text' : ''}>
                        {apt.patient}
                      </span>
                    </td>
                    <td className="td-content">
                      <span className={apt.status === 'Cancelled' ? 'cancelled-text' : ''}>
                        {formatOriginalDateTime(apt.originalDate, apt.originalTime)}
                      </span>
                    </td>
                    <td className="td-content">
                      <div className="datetime-inputs">
                        <input
                          type="date"
                          value={apt.newDate}
                          onChange={(e) => handleDateChange(apt.id, e.target.value)}
                          disabled={apt.status === 'Cancelled' || !apt.isEditing}
                          className={`datetime-date ${
                            apt.status === 'Cancelled' || !apt.isEditing ? 'input-disabled' : ''
                          }`}
                        />
                        <input
                          type="time"
                          value={apt.newTime}
                          onChange={(e) => handleTimeChange(apt.id, e.target.value)}
                          disabled={apt.status === 'Cancelled' || !apt.isEditing}
                          className={`datetime-time ${
                            apt.status === 'Cancelled' || !apt.isEditing ? 'input-disabled' : ''
                          }`}
                        />
                      </div>
                    </td>
                    <td className="td-content">
                      <span className={`status-badge status-${apt.status.toLowerCase()}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="td-content">
                      <span className={apt.status === 'Cancelled' ? 'cancelled-text' : ''}>
                        {apt.reason}
                      </span>
                    </td>
                    <td className="td-content">
                      <div className="action-buttons">
                        <button
                          onClick={() => toggleEdit(apt.id)}
                          disabled={apt.status === 'Cancelled'}
                          className={`action-btn ${
                            apt.status === 'Cancelled' 
                              ? 'btn-disabled' 
                              : apt.isEditing 
                                ? 'btn-edit-active' 
                                : 'btn-edit'
                          }`}
                          title={apt.isEditing ? "Save changes" : "Edit appointment"}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(apt)}
                          className="action-btn btn-delete"
                          title="Delete appointment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon">
                <AlertTriangle className="icon-warning" size={24} />
              </div>
              <h3 className="modal-title">Confirm Deletion</h3>
            </div>
            
            <p className="modal-text">
              Are you sure you want to delete the appointment for{' '}
              <span className="modal-patient-name">{appointmentToDelete?.patient}</span>?
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button onClick={confirmDelete} className="modal-btn modal-btn-delete">
                Delete
              </button>
              <button onClick={cancelDelete} className="modal-btn modal-btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyReschedule;