import './App.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import PaymentTracking from './pages/Payments';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/payment" element={<PaymentTracking />} />
      </Routes>
    </HashRouter>
  );
}

export default App;