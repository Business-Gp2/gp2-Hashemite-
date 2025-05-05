import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Student Components
import Dashboard from "./components/dashboard/Dashboard";
import StudentDashboard from "./components/dashboard/StudentDashboard";
import MyDocuments from "./components/dashboard/MyDocuments";
import UploadDocument from "./components/dashboard/UploadDocument";
import DraftDocument from "./components/dashboard/DraftDocument";
import Courses from "./components/dashboard/Courses";
import Messages from "./components/dashboard/Messages";
import Profile from "./components/dashboard/Profile";

// Doctor Components
import DoctorDashboard from "./components/dashboard/DoctorDashboard";
import DoctorAllDocuments from "./components/dashboard/DoctorAllDocuments";
import DoctorPendingDocuments from "./components/dashboard/DoctorPendingDocuments";
import DoctorMessages from "./components/dashboard/DoctorMessages";
import DoctorProfile from "./components/dashboard/DoctorProfile";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="my-documents" element={<MyDocuments />} />
              <Route path="upload-document" element={<UploadDocument />} />
              <Route path="draft-document" element={<DraftDocument />} />
              <Route path="courses" element={<Courses />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/all-documents"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorAllDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/pending-documents"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorPendingDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/messages"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorProfile />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
