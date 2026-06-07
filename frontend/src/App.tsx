import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Invoices from './pages/Invoices';
import Dashboard from './pages/Dashboard';
import CustomerProfile from './pages/CustomerProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Invoices />} />
        <Route path="/summary" element={<Dashboard />} />
        <Route path="/customers/:id" element={<CustomerProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
