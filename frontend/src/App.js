import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx';
import AddPatient from './pages/add_patient.jsx';
import DentalLabs from './pages/dental_labs.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add_patient" element={<AddPatient />} />
        <Route path="/dental_labs" element={<DentalLabs />} />
      </Routes>
    </Router>
  );
}

export default App;