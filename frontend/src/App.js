// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Payments from './pages/Payments';
import PatientList from './pages/PatientList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/payments" element={<Payments />} />
        <Route path="/patient-list" element={<PatientList />} />
      </Routes>
    </Router>
  );
}

export default App;