import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  console.log("🟢 [ProtectedRoute] Check:", {
    loading,
    isAuthenticated,
    user: user?.email,
    role: user?.role,
    allowedRoles,
    token: localStorage.getItem("token") ? "EXISTS" : "MISSING"
  });

  if (loading) {
    console.log("🟢 [ProtectedRoute] Loading... showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("🔴 [ProtectedRoute] NOT authenticated → redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("🔴 [ProtectedRoute] Wrong role → redirecting");
    if (user.role === "admin")    return <Navigate to="/admin/dashboard"    replace />;
    if (user.role === "lecturer") return <Navigate to="/lecturer/dashboard" replace />;
    return                               <Navigate to="/student/dashboard"  replace />;
  }

  console.log("🟢 [ProtectedRoute] ALL GOOD → rendering children");
  return children;
};

export default ProtectedRoute;