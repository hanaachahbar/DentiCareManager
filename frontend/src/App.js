// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Payments from './pages/Payments';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Payments />} />
      </Routes>
    </Router>
  );
}

export default App;