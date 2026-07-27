import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import DoctorProfile from './pages/DoctorProfile';
import SymptomChat from './pages/SymptomChat';
import Appointments from './pages/Appointments';
import Records from './pages/Records';
import Medications from './pages/Medications';
import EmergencyGuidance from './pages/EmergencyGuidance';
import Profile from './pages/Profile';
import AIDashboard from './pages/AIDashboard';
import VideoCall from './pages/VideoCall';
import Pharmacy from './pages/Pharmacy';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const DashboardSelector = () => {
  const { user } = useAuth();
  if (user?.role === 'doctor' || user?.role === 'admin') return <DoctorDashboard />;
  if (user?.role === 'pharmacy') return <PharmacyDashboard />;
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ className: 'font-sans font-bold text-sm' }} />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={<DashboardSelector />}
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/video-call/:appointmentId"
            element={
              <PrivateRoute>
                <VideoCall />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <SymptomChat />
              </PrivateRoute>
            }
          />
          <Route
            path="/records"
            element={
              <PrivateRoute>
                <Records />
              </PrivateRoute>
            }
          />
          <Route
            path="/medications"
            element={
              <PrivateRoute>
                <Medications />
              </PrivateRoute>
            }
          />
          <Route
            path="/ai-dashboard"
            element={
              <PrivateRoute>
                <AIDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/pharmacy"
            element={
              <PrivateRoute>
                <Pharmacy />
              </PrivateRoute>
            }
          />
          <Route
            path="/emergency"
            element={
              <PrivateRoute>
                <EmergencyGuidance />
              </PrivateRoute>
            }
          />
          <Route
            path="/pharmacy-dashboard"
            element={
              <PrivateRoute>
                <PharmacyDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/:id"
            element={
              <PrivateRoute>
                <DoctorProfile />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
