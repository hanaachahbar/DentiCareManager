// src/components/AppointmentsMainPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import '../styles/Appointement.css';

const AppointmentsMainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use actual current date (2025 now) for selectedDate and currentMonth
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [viewMode, setViewMode] = useState('daily');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/appointments');
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      console.log('Fetched appointments:', data); // Debug log
      let appointmentsList = [];
      
      // Handle different response formats
      if (Array.isArray(data)) {
        appointmentsList = data;
      } else if (data.appointments && Array.isArray(data.appointments)) {
        appointmentsList = data.appointments;
      }

      console.log('Appointments list:', appointmentsList); // Debug log

      // Transform backend data to frontend format
      const transformedAppointments = appointmentsList.map((apt) => {
        const dateObj = new Date(apt.appointment_date);
        let timeStr = apt.appointment_time || '00:00';
        
        // Convert time format HH:MM to display format
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const displayTime = `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;

        // Map status from backend
        let statusMap = {
          'pending': 'Pending',
          'checked-in': 'Confirmed',
          'cancelled': 'Cancelled'
        };

        return {
          id: apt.appointment_id,
          patient: `${apt.first_name} ${apt.last_name}`,
          date: dateObj,
          time: displayTime,
          status: statusMap[apt.status] || apt.status,
          reason: apt.service_name || 'General Appointment',
          description: apt.description || '',
          appointment_id: apt.appointment_id
        };
      });

      console.log('Transformed appointments:', transformedAppointments); // Debug log
      setAppointments(transformedAppointments);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    
    // Refresh appointments when page comes into focus
    const handleFocus = () => {
      fetchAppointments();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateShort = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getWeekStart = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  const getWeekEnd = (date) => {
    const weekStart = getWeekStart(date);
    return new Date(
      weekStart.getFullYear(),
      weekStart.getMonth(),
      weekStart.getDate() + 6
    );
  };

  const isInSameWeek = (date1, date2) => {
    const weekStart1 = getWeekStart(date1);
    const weekEnd1 = getWeekEnd(date1);
    return date2 >= weekStart1 && date2 <= weekEnd1;
  };

  const isInSameMonth = (date1, date2) => {
    return (
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getFilteredAppointments = () => {
    switch (viewMode) {
      case 'daily':
        return appointments.filter((apt) => isSameDay(apt.date, selectedDate));
      case 'weekly':
        return appointments.filter((apt) =>
          isInSameWeek(selectedDate, apt.date)
        );
      case 'monthly':
        return appointments.filter((apt) =>
          isInSameMonth(selectedDate, apt.date)
        );
      default:
        return appointments;
    }
  };

  const getTodayAppointments = () => {
    return appointments.filter((apt) => isSameDay(apt.date, selectedDate));
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    setCurrentMonth(newMonth);
    if (!isInSameMonth(selectedDate, newMonth)) {
      setSelectedDate(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    setCurrentMonth(newMonth);
    if (!isInSameMonth(selectedDate, newMonth)) {
      setSelectedDate(new Date(newMonth.getFullYear(), newMonth.getMonth(), 1));
    }
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handleDeleteClick = (apt) => {
    setAppointmentToDelete(apt);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (appointmentToDelete) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/appointments/${appointmentToDelete.appointment_id}`,
          { method: 'DELETE' }
        );
        
        if (!response.ok) throw new Error('Failed to delete appointment');
        
        setAppointments((prev) =>
          prev.filter((apt) => apt.id !== appointmentToDelete.id)
        );
      } catch (err) {
        console.error('Error deleting appointment:', err);
        setError('Failed to delete appointment');
      } finally {
        setShowDeleteConfirm(false);
        setAppointmentToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAppointmentToDelete(null);
  };

  const handleAddAppointmentClick = () => {
    navigate('/add_appointment');
  };

  const filteredAppointments = getFilteredAppointments();
  const todayAppointments = getTodayAppointments();
  const days = getDaysInMonth(currentMonth);

  const getViewTitle = () => {
    switch (viewMode) {
      case 'daily':
        return `Appointments for ${formatDate(selectedDate)}`;
      case 'weekly':
        const weekStart = getWeekStart(selectedDate);
        const weekEnd = getWeekEnd(selectedDate);
        return `Appointments for ${formatDateShort(
          weekStart
        )} - ${formatDateShort(weekEnd)}, ${weekEnd.getFullYear()}`;
      case 'monthly':
        return `Appointments for ${selectedDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })}`;
      default:
        return 'Appointments';
    }
  };

  return (
    <div className="appointments-container">
      {loading && (
        <div className="appointments-wrapper">
          <div className="appointments-card">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading appointments...</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="appointments-wrapper">
          <div className="appointments-card">
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#d32f2f',
              backgroundColor: '#ffebee',
              borderRadius: '8px'
            }}>
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
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
        </div>
      )}

      {!loading && !error && (
      <div className="appointments-wrapper">
        <div className="appointments-card">
          <div className="appointments-header">
            <h1 className="appointments-title">Appointments</h1>
            <div className="appointments-actions">
              <button
                onClick={handleAddAppointmentClick}
                className="btn btn-primary"
              >
                <Plus className="icon" />
                Add Appointment
              </button>
              <button
                onClick={() => navigate('/emergency_reschedule')}
                className="btn btn-emergency"
              >
                <Calendar className="icon" />
                Emergency Reschedule
              </button>
            </div>
          </div>

          <div className="view-mode-selector">
            <div className="view-mode-buttons">
              <button
                onClick={() => setViewMode('daily')}
                className={`view-mode-btn ${
                  viewMode === 'daily' ? 'active' : ''
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`view-mode-btn ${
                  viewMode === 'weekly' ? 'active' : ''
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`view-mode-btn ${
                  viewMode === 'monthly' ? 'active' : ''
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="calendar-appointments-container">
            <div className="calendar-appointments-grid">
              <div className="calendar-section">
                <div className="calendar-header">
                  <button
                    onClick={handlePrevMonth}
                    className="calendar-nav-btn"
                  >
                    ←
                  </button>
                  <h3 className="calendar-month-title">
                    {currentMonth.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className="calendar-nav-btn"
                  >
                    →
                  </button>
                </div>

                <div className="calendar-weekdays">
                  <div>S</div>
                  <div>M</div>
                  <div>T</div>
                  <div>W</div>
                  <div>T</div>
                  <div>F</div>
                  <div>S</div>
                </div>

                <div className="calendar-days">
                  {days.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDateClick(day)}
                      className={`calendar-day ${!day ? 'invisible' : ''} ${
                        day && isSameDay(day, selectedDate) ? 'selected' : ''
                      }`}
                    >
                      {day ? day.getDate() : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="today-appointments-section">
                <div className="today-header">
                  <h2 className="today-title">
                    Appointments for {formatDate(selectedDate)}
                  </h2>
                </div>
                <div className="today-appointments-list">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`appointment-card status-${apt.status.toLowerCase()}`}
                      >
                        <div className="appointment-content">
                          <div className="appointment-time-patient">
                            {apt.time} - {apt.patient}
                          </div>
                          <div className="appointment-reason">
                            {apt.reason}
                          </div>
                          {apt.status === 'Pending' && (
                            <div className="appointment-pending-note">
                              (Pending Confirmation)
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-appointments">
                      No appointments scheduled
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="appointments-table-section">
            <h3 className="table-title">{getViewTitle()}</h3>
            <div className="table-container">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>APPOINTMENT ID</th>
                    <th>PATIENT</th>
                    <th>DATE & TIME</th>
                    <th>STATUS</th>
                    <th>REASON FOR VISIT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id}>
                        <td>#{apt.id}</td>
                        <td>{apt.patient}</td>
                        <td>
                          {formatDate(apt.date)} - {apt.time}
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${apt.status.toLowerCase()}`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td>{apt.reason}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteClick(apt)}
                            className="delete-btn"
                          >
                            <Trash2 className="delete-icon" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Confirm Delete</h2>
            <p className="modal-text">
              Are you sure you want to delete the appointment for{' '}
              <strong>{appointmentToDelete?.patient}</strong> on{' '}
              {appointmentToDelete && formatDate(appointmentToDelete.date)} at{' '}
              {appointmentToDelete?.time}?
            </p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="btn btn-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn btn-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsMainPage;
