import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Leaves from './pages/Leaves';
import Attendance from './pages/Attendance';
import Announcements from './pages/Announcements';
import Training from './pages/Training';
import Profile from './pages/Profile';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container py-4">{children}</main>
    </>
  );
}

const page = (el, roles) => (
  <ProtectedRoute roles={roles}>
    <Layout>{el}</Layout>
  </ProtectedRoute>
);

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={page(<Dashboard />)} />
      <Route path="/employees" element={page(<Employees />, ['hr', 'manager'])} />
      <Route path="/leaves" element={page(<Leaves />)} />
      <Route path="/attendance" element={page(<Attendance />)} />
      <Route path="/announcements" element={page(<Announcements />)} />
      <Route path="/training" element={page(<Training />)} />
      <Route path="/profile" element={page(<Profile />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
