import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './utils/AuthContext';
import LoginPage from './pages/LoginPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Layout from './components/Layout';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'manager' ? '/manager' : '/employee'} replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'manager' ? '/manager' : '/employee'} replace /> : <LoginPage />
      } />

      <Route path="/employee" element={
        <ProtectedRoute role="employee">
          <Layout>
            <EmployeeDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/manager" element={
        <ProtectedRoute role="manager">
          <Layout>
            <ManagerDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={
        user
          ? <Navigate to={user.role === 'manager' ? '/manager' : '/employee'} replace />
          : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}
