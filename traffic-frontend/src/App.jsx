import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ViolationsList from './pages/ViolationsList';
import AddViolation from './pages/AddViolation';
import ActivityLogs from './pages/ActivityLogs';
import Navbar from './components/Navbar';
import './App.css';

// حماية عامة: لازم تكون مسجل دخول
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// حماية للـ admin و HR معًا (للإضافة واللوج)
const AdminOrHrRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  
  // نقبل admin أو hr (بأي صيغة: hr, Hr, HR, " hr ")
  const normalizedRole = role?.toLowerCase().trim();
  if (normalizedRole === 'admin' || normalizedRole === 'hr') {
    return children;
  }

  return <Navigate to="/" />;
};

// حماية للـ admin بس (لو عايز صفحات تانية في المستقبل)
const AdminOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role')?.toLowerCase().trim();

  if (!token) return <Navigate to="/login" />;
  return role === 'admin' ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <div className="app-container min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* الصفحة الرئيسية - كل المسجلين يشوفوها */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ViolationsList />
              </PrivateRoute>
            }
          />

          {/* صفحة إضافة مخالفة - للـ admin و HR */}
          <Route
            path="/add"
            element={
              <AdminOrHrRoute>
                <AddViolation />
              </AdminOrHrRoute>
            }
          />

          {/* صفحة اللوج - للـ admin و HR */}
          <Route
            path="/logs"
            element={
              <AdminOrHrRoute>
                <ActivityLogs />
              </AdminOrHrRoute>
            }
          />

          {/* أي مسار غلط → ارجع للرئيسية */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
