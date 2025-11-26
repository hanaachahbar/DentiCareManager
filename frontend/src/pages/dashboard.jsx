import '../styles/dashboard.css';
import { UserPlus, CalendarPlus, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const appointments = [
    { id: 1, name: 'John Doe', time: '10:30 AM', type: 'Routine Check-up', status: 'Checked-in', initials: 'JD' },
    { id: 2, name: 'Lisa Smith', time: '11:00 AM', type: 'Filling', status: 'Pending', initials: 'LS' },
    { id: 3, name: 'Michael Johnson', time: '12:15 PM', type: 'Teeth Whitening', status: 'Pending', initials: 'MJ' },
    { id: 4, name: 'Emily Williams', time: '2:00 PM', type: 'Consultation', status: 'Pending', initials: 'EW' },
    { id: 5, name: 'Chris Brown', time: '3:30 PM', type: 'Root Canal', status: 'Pending', initials: 'CB' }
  ];

  const newPatients = [
    { name: 'Jane Smith', registered: 'Today' },
    { name: 'Robert Brown', registered: 'Today' },
    { name: 'Danil Ouakli', registered: 'Today' }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, Dr. Amelia</h1>
        <p>Here's your dashboard for today, Monday, 24th July.</p>
      </header>

      <div className="dashboard-grid">
        <section className="card dashboard-appointments-card">
          <h2>Upcoming Appointments</h2>
          <div className="appointments-list">
            {appointments.map(apt => (
              <div key={apt.id} className="appointment-item">
                <div className="appointment-left">
                  <div className="avatar">{apt.initials}</div>
                  <div className="appointment-details">
                    <div className="patient-name">{apt.name}</div>
                    <div className="appointment-time">{apt.time} - {apt.type}</div>
                  </div>
                </div>
                <span className={`status-badge ${apt.status.toLowerCase().replace('-', '')}`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </section>


        <section className="card stats-card">
          <h2>Daily At a Glance</h2>
          
          <div className="stat-item">
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">12</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">$1,500</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Completed Treatments</div>
            <div className="stat-value">8</div>
          </div>
        </section>

        <section className="card side-card">
          <h2>New Patient Registrations</h2>
          <div className="patients-list">
            {newPatients.map((patient, idx) => (
              <div key={idx} className="patient-item">
                <div>
                  <div className="patient-name">{patient.name}</div>
                  <div className="registered-date">Registered: {patient.registered}</div>
                </div>
                <button className="link-button">View Profile</button>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: '40px' }}>Quick Actions</h2>
          <div className="quick-actions">
            <button className="dashboard-action-button primary"
             onClick={() => navigate('/add_patient')}
            >
              <UserPlus/> Add New Patient
            </button>
            <button className="dashboard-action-button secondary">
              <CalendarPlus/> Schedule Appointment
            </button>
            <button className="dashboard-action-button secondary">
              <ClipboardList/> Create Treatment Plan
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}