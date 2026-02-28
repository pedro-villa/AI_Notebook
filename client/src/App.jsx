import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LogUsage from './pages/LogUsage';
import Declarations from './pages/Declarations';
import HelpCenter from './pages/HelpCenter';
import AdminPanel from './pages/AdminPanel';
import SystemStatus from './pages/SystemStatus';

// Wrap a page in the shared sidebar layout
const WithLayout = ({ children }) => <AppLayout>{children}</AppLayout>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Routes>
            {/* Public routes */}
            <Route path="/"         element={<Navigate to="/login" replace />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes — all wrapped in AppLayout sidebar */}
            <Route path="/dashboard" element={
              <ProtectedRoute><WithLayout><Dashboard /></WithLayout></ProtectedRoute>
            } />
            <Route path="/log" element={
              <ProtectedRoute><WithLayout><LogUsage /></WithLayout></ProtectedRoute>
            } />
            <Route path="/declarations" element={
              <ProtectedRoute><WithLayout><Declarations /></WithLayout></ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute><WithLayout><HelpCenter /></WithLayout></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><WithLayout><AdminPanel /></WithLayout></ProtectedRoute>
            } />
            <Route path="/system" element={
              <ProtectedRoute><WithLayout><SystemStatus /></WithLayout></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
