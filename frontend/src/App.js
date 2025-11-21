import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/navbar/navbar';

import Dashboard from './pages/dashboard.jsx';
import AddPatient from './pages/add_patient.jsx';
import DentalLabs from './pages/dental_labs.jsx';
import Payments from './pages/Payments';
import PatientList from './pages/PatientList';
import MedicamentsDrugList from './pages/MedicamentsDrugList';
import AppointmentsMainPage from './pages/Appointment.jsx'; 
import AddAppointmentPage from './pages/AddAppointement.jsx';
import EmergencyReschedule2 from './pages/EmergencyReschedule.jsx';
import AddBillForm from './pages/Add_new_bill.jsx'; 

function App() {
  return (
    <Router>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add_patient" element={<AddPatient />} />
          <Route path="/dental_labs" element={<DentalLabs />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/patient-list" element={<PatientList />} />
          <Route path="/medicament-list" element={<MedicamentsDrugList />} />
          <Route path="/appointments" element={<AppointmentsMainPage />} />
          <Route path="/add_appointment" element={<AddAppointmentPage />} />
          <Route path="/emergency_reschedule" element={<EmergencyReschedule2 />} />
          <Route path="/add_bill" element={<AddBillForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
