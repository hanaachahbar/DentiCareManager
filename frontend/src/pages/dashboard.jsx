import '../styles/dashboard.css';
import { UserPlus, CalendarPlus, ClipboardList, List } from 'lucide-react';
import { data, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);

  function getInitials(name) {
    var initial = '';
    for(var i=0; i<name.length; i++) {
      if(i==0) initial += name[i].toUpperCase();
      if(name[i] == ' ') return initial + name[i+1].toUpperCase();
    }
  }


  const [newPatients, setNewPatients] = useState([]);

  async function getNewPatients() {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      console.log(response.data);
      const max_length = (response.data.length < 5) ? response.data.length: 5;
      var patient_list = [];
      for(var i=0; i<max_length; i++) {
        const patient = response.data[i];
        patient_list.push(
          {id: patient['patient_id'], name: patient['first_name'] + ' ' +  patient['last_name'], registered: patient.created_at.split(" ")[0]}
        );
      }
      setNewPatients(patient_list);

    }
    catch(error) {
      console.log("Patients Error:", error);
    }
  }

  async function getAppointments() {
    try {
      const response = await axios.get('http:///localhost:5000/api/appointments/upcoming');
      console.log("Upcoming Appintments:", response.data);
      if(response.data.count == 0) return;

      const A = response.data.appointments;
      setAppointments(A.slice(0, 6).map(ap => ({
        id: ap.appointment_id,
        name: ap.first_name + ' ' + ap.last_name,
        time: ap.appointment_date,
        type: ap.service_name,
        status: ap.status,
        initials: getInitials(ap.first_name + ' ' + ap.last_name)
      })));
    }
    catch(error) {
      console.log("Appointments Error", error);
    }
  }

  useEffect(() => {
    getNewPatients();
    getAppointments();
  }, []);

  function getFullFormattedDate() {
    const date = new Date();
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const suffix =
      day % 10 === 1 && day !== 11 ? "st" :
      day % 10 === 2 && day !== 12 ? "nd" :
      day % 10 === 3 && day !== 13 ? "rd" : "th";
    return `${dayOfWeek}, ${day}${suffix} ${month}`;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, Dr. Amelia</h1>
        <p>Here's your dashboard for today, {getFullFormattedDate()}.</p>
      </header>

      <div className="dashboard-grid">
        <section className="card-dashboard dashboard-appointments-card">
          <h2>Upcoming Appointments</h2>
          <div className="appointments-list">
            {appointments.map(apt => (
              <div key={apt.id} className="dashboard-appointment-item">
                <div className="dashboard-appointment-left">
                  <div className="appoint-avatar">{apt.initials}</div>
                  <div className="dashboard-appointment-details">
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


        <section className="card-dashboard stats-card">
          <h2>Daily At a Glance</h2>
          
          <div className="dashboard-stat-item">
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">12</div>
          </div>

          <div className="dashboard-stat-item">
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">$1,500</div>
          </div>

          <div className="dashboard-stat-item">
            <div className="stat-label">Completed Treatments</div>
            <div className="stat-value">8</div>
          </div>
        </section>

        <section className="card-dashboard side-card">
          <h2>New Patient Registrations</h2>
          <div className="patients-list">
            {newPatients.map((patient, idx) => (
              <div key={idx} className="patient-item">
                <div>
                  <div className="patient-name">{patient.name}</div>
                  <div className="registered-date">Registered: {patient.registered}</div>
                </div>
                <button className="link-button-dashboard" onClick={() => navigate(`/patient_profile/${patient.id}`)}>View Profile</button>
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
            <button className="dashboard-action-button secondary"
              onClick={() => navigate('/appointments')}
            >
              <CalendarPlus/> Schedule Appointment
            </button>
            {/*<button className="dashboard-action-button secondary"
              onClick={() => navigate('')}
            >
              <ClipboardList/> Create Treatment Plan
            </button>*/}
          </div>
        </section>
      </div>
    </div>
  );
}