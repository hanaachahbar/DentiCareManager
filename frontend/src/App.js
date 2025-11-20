import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx';
import AddPatient from './pages/add_patient.jsx';
import DentalLabs from './pages/dental_labs.jsx';
import Payments from './pages/Payments';
import PatientList from './pages/PatientList';
import MedicamentsDrugList from './pages/MedicamentsDrugList'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add_patient" element={<AddPatient />} />
        <Route path="/dental_labs" element={<DentalLabs />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/patient-list" element={<PatientList />} />
        <Route path="/medicament-list" element={<MedicamentsDrugList />} />
      </Routes>
    </Router>
  );
}

export default App;