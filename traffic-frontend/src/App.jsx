import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ViolationsList from './pages/ViolationsList';
import AddViolation from './pages/AddViolation';
import Navbar from './components/Navbar';

// مكون لحماية المسارات اللي تحتاج تسجيل دخول
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// مكون لحماية مسارات الادمن
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" />;
  return role === 'admin' ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* مسارات عامة */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* مسارات محمية */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <ViolationsList />
            </PrivateRoute>
          }
        />

        <Route
          path="/add"
          element={
            <AdminRoute>
              <AddViolation />
            </AdminRoute>
          }
        />

        {/* إعادة التوجيه لأي رابط غير معروف */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;

