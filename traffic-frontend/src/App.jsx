import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ViolationsList from './pages/ViolationsList';
import AddViolation from './pages/AddViolation';
import ActivityLogs from './pages/ActivityLogs';
import Navbar from './components/Navbar';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
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

          <Route
            path="/logs"
            element={
              <AdminRoute>
                <ActivityLogs />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
