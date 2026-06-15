// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentDocuments from "./pages/student/Documents";

// Lecturer pages
import LecturerDashboard from "./pages/lecturer/Dashboard";
import LecturerSubmissions from "./pages/lecturer/SubmissionsPage";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminDocumentsPage from "./pages/admin/DocumentsPage"; // ← we'll create this next

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#1e293b",
              color: "#fff",
              fontSize: "14px",
            },
          }}
        />

        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Student ── */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="documents" element={<StudentDocuments />} />
          </Route>

          {/* ── Lecturer ── */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<LecturerDashboard />} />
            <Route path="submissions" element={<LecturerSubmissions />} />
            <Route path="documents" element={<StudentDocuments />} /> 
          </Route>

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />         
            <Route path="documents" element={<AdminDocumentsPage />} />
            <Route path="my-documents" element={<StudentDocuments />} />  
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;