import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientProfile from './pages/Patient_profile';
import ODF from './pages/ServiceDetails';
import AddServiceForm from './pages/AddServiceForm'; // Add this import

function App() {
  return (
    <Router>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <Routes>


          <Route path="/service-details" element={<ODF />} />
          <Route path="/add-service" element={<AddServiceForm />} />
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
