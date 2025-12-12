import '../styles/dashboard.css';
import { UserPlus, CalendarPlus, CalendarX, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [dailyAmount, setDailyAmount] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [foundPatients, setFoundPatients] = useState(false);
  const [foundUpcomingAppointments, setFoundUpcoming] = useState(false);

  function getInitials(name) {
    var initial = '';
    for(var i=0; i<name.length; i++) {
      if(i===0) initial += name[i].toUpperCase();
      if(name[i] === ' ') return initial + name[i+1].toUpperCase();
    }
  }


  const [newPatients, setNewPatients] = useState([]);

  async function getNewPatients() {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      console.log(response.data);
      if(response.data.length > 0) {
        setFoundPatients(true);
      }
      const max_length = (response.data.length < 5) ? response.data.length: 5;
      var patient_list = [];
      for(var i=0; i<max_length; i++) {
        const patient = patientsList[i];
        patient_list.push(
          {id: patient['patient_id'] || patient['id'], name: patient['first_name'] + ' ' +  patient['last_name'], registered: patient.created_at.split(" ")[0]}
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
      const response = await axios.get('http://localhost:5000/api/appointments/upcoming');
      console.log("Upcoming Appointments:", response.data.appointments);
      if(response.data.count === 0) return;

      setFoundUpcoming(true);
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
      console.log("Upcoming Appointments Error", error);
    }
  }

  async function getAppointmentsNumber() {
    try {
      const response = await axios.get('http://localhost:5000/api/appointments');
      setTotalAppointments(response.data.count);
    }
    catch(error) {
      console.log("Getting total appointments Error: ", error);
    }
  }

  async function getdailyRevenue() {
    try {
      const response = await axios.get('http://localhost:5000/api/invoices/total-amount');
      setDailyAmount(response.data.total);
    }
    catch(error) {
      console.log("Getting daily revenue Error: ", error);
    }
  }

  async function getTotalCompletedServices() {
    try {
      const response = await axios.get('http://localhost:5000/api/services/completeServices');
      setCompletedServices(response.data.total);
    }
    catch(error) {
      console.log("Getting total completed services Error: ", error);
    }
  }

  useEffect(() => {
    getNewPatients();
    getAppointments();
    getAppointmentsNumber();
    getdailyRevenue();
    getTotalCompletedServices();
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
            {foundUpcomingAppointments ? appointments.map(apt => (
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
            ))
            : <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', height: 200
              }}>
                <CalendarX size={40} color='gray'/>
                <p style={{padding: 30, fontSize: 18, color: 'gray'}}>no upcoming appointments at the moment</p>
              </div>}
          </div>
        </section>


        <section className="card-dashboard stats-card">
          <h2>Daily At a Glance</h2>
          
          <div className="dashboard-stat-item">
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">{totalAppointments}</div>
          </div>

          <div className="dashboard-stat-item">
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">{dailyAmount} DA</div>
          </div>

          <div className="dashboard-stat-item">
            <div className="stat-label">Completed Treatments</div>
            <div className="stat-value">{completedServices}</div>
          </div>
        </section>

        <section className="card-dashboard side-card">
          <h2>New Patient Registrations</h2>
          <div className="patients-list">
            {foundPatients ? newPatients.map((patient, idx) => (
              <div key={idx} className="patient-item">
                <div>
                  <div className="patient-name">{patient.name}</div>
                  <div className="registered-date">Registered: {patient.registered}</div>
                </div>
                <button className="link-button-dashboard" onClick={() => navigate(`/patient_profile/${patient.id}`)}>View Profile</button>
              </div>
            ))
            : <div style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', height: 200
              }}>
                <UserX size={40} color='gray'/>
                <p style={{padding: 30, fontSize: 18, color: 'gray'}}>no registrations at the moment</p>
              </div>}
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