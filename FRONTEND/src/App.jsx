import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import './App.css';
import ManageUsers from './pages/ManageUsers';
import SecurityOverview from './pages/SecurityOverview';
import EmployeeOverview from './pages/EmployeeOverview';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee-overview" element={<EmployeeOverview />} />
        <Route path="/security-dashboard" element={<SecurityDashboard />} />
        <Route path="/security-overview" element={<SecurityOverview />} />
        <Route path="/manage-users" element={<ManageUsers/>} />

      </Routes>
    </Router>
  );
}
export default App;