import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientProfile from './pages/Patient_profile';
import ODF from './pages/ODF';
import AddServiceForm from './pages/AddServiceForm'; // Add this import

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PatientProfile />} />
          <Route path="/patient-profile" element={<PatientProfile />} />
          <Route path="/odf" element={<ODF />} />
          <Route path="/add-service" element={<AddServiceForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;