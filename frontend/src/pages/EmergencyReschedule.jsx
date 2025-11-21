import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, AlertTriangle, Edit2, Trash2, Search } from 'lucide-react';
import '../styles/EmergencyReschedule.css';

const EmergencyReschedule2 = () => {
  // All appointments from database
  const [allAppointments] = useState([
    { id: '12345', patient: 'John Doe', originalDate: '2024-10-05', originalTime: '09:00 AM', newDate: '2024-10-05', newTime: '09:00', status: 'Confirmed', reason: 'Routine Check-up', isEditing: false },
    { id: '12346', patient: 'Jane Smith', originalDate: '2024-10-05', originalTime: '10:30 AM', newDate: '2024-10-05', newTime: '10:30', status: 'Pending', reason: 'Filling', isEditing: false },
    { id: '12347', patient: 'Michael Johnson', originalDate: '2024-10-05', originalTime: '02:00 PM', newDate: '2024-10-05', newTime: '14:00', status: 'Confirmed', reason: 'Cleaning', isEditing: false },
    { id: '12348', patient: 'Emily Williams', originalDate: '2024-10-04', originalTime: '11:00 AM', newDate: '2024-10-04', newTime: '11:00', status: 'Cancelled', reason: 'Consultation', isEditing: false },
    { id: '12349', patient: 'David Brown', originalDate: '2024-10-06', originalTime: '09:30 AM', newDate: '2024-10-06', newTime: '09:30', status: 'Confirmed', reason: 'X-Ray', isEditing: false },
    { id: '12350', patient: 'Sarah Wilson', originalDate: '2024-10-07', originalTime: '01:00 PM', newDate: '2024-10-07', newTime: '13:00', status: 'Pending', reason: 'Blood Test', isEditing: false },
    { id: '12351', patient: 'Robert Taylor', originalDate: '2024-10-10', originalTime: '10:00 AM', newDate: '2024-10-10', newTime: '10:00', status: 'Confirmed', reason: 'Follow-up', isEditing: false },
    { id: '12352', patient: 'Lisa Anderson', originalDate: '2024-10-12', originalTime: '03:00 PM', newDate: '2024-10-12', newTime: '15:00', status: 'Pending', reason: 'Consultation', isEditing: false },
    { id: '12353', patient: 'James Martinez', originalDate: '2024-10-15', originalTime: '11:30 AM', newDate: '2024-10-15', newTime: '11:30', status: 'Confirmed', reason: 'Vaccination', isEditing: false },
    { id: '12354', patient: 'Maria Garcia', originalDate: '2024-10-20', originalTime: '02:30 PM', newDate: '2024-10-20', newTime: '14:30', status: 'Confirmed', reason: 'Checkup', isEditing: false },
  ]);

  const [appointments, setAppointments] = useState(allAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkDate, setBulkDate] = useState('');
  const [bulkDuration, setBulkDuration] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

  const toggleEdit = (id) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, isEditing: !apt.isEditing } : apt
    ));
  };

  const handleBulkReschedule = () => {
    if (!bulkDate || !bulkDuration) {
      alert('Please fill in both date and duration for bulk reschedule');
      return;
    }

    const hours = parseInt(bulkDuration);
    
    const updatedAppointments = appointments.map(apt => {
      const [time, period] = apt.originalTime.split(' ');
      let [hour, minute] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      // Add duration
      hour += hours;
      
      const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      return {
        ...apt,
        newDate: bulkDate,
        newTime: newTime,
        isEditing: false
      };
    });

    setAppointments(updatedAppointments);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const updatedAppointments = appointments.filter(apt => apt.id !== appointmentToDelete.id);
    setAppointments(updatedAppointments);
    setShowDeleteConfirm(false);
    setAppointmentToDelete(null);
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

  const handleSaveChanges = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleNotify = (id) => {
    alert(`Notification sent to patient for appointment #${id}`);
  };

  const convert24to12Hour = (time24) => {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

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
            <button onClick={handleSaveChanges} className="save-button">
              <Calendar size={20} />
              Save Changes
            </button>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="success-message">
              <Calendar size={20} />
              <span>Changes saved successfully!</span>
            </div>
          )}

          {/* Bulk Reschedule */}
          <div className="bulk-reschedule-section">
            <div className="bulk-header">
              <AlertTriangle className="alert-icon" size={20} />
              <div className="bulk-text">
                <h3 className="bulk-title">Bulk Reschedule</h3>
                <p className="bulk-description">
                  Reschedule all of today's appointments to a new date or by a duration.
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
                  placeholder="10/27/2023"
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  value={bulkDuration}
                  onChange={(e) => setBulkDuration(e.target.value)}
                  className="duration-input"
                  placeholder="e.g., 2 hours"
                />
              </div>
              <button onClick={handleBulkReschedule} className="apply-button">
                Apply
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

export default EmergencyReschedule2;