import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar/navbar"; // Only if Navbar.js exists

import Dashboard from "./pages/dashboard";
import AddPatient from "./pages/add_patient";
import DentalLabs from "./pages/dental_labs";
import Payments from "./pages/Payments";
import PatientList from "./pages/PatientList";
import MedicamentsDrugList from "./pages/MedicamentsDrugList";
import AppointmentsMainPage from "./pages/Appointment";
import AddAppointmentPage from "./pages/AddAppointement";
import EmergencyReschedule2 from "./pages/EmergencyReschedule";
import AddBillForm from "./pages/Add_new_bill";
import PrescriptionManagement  from "./pages/PrescriptionManagement";
import PatientProfile from "./pages/Patient_profile";
import ServiceDetails from "./pages/service_details"; 
import AddServiceForm from "./pages/AddServiceForm";

function App() {
  return (
    <Router>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/patient_profile/:patientId" element={<PatientProfile />} />


          <Route path="/service-details" element={<ServiceDetails />} />
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
          <Route path="/prescription_management" element={<PrescriptionManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
