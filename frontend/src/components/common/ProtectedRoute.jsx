// frontend/src/components/common/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin")    return <Navigate to="/admin/dashboard"    replace />;
    if (user.role === "lecturer") return <Navigate to="/lecturer/dashboard" replace />;
    return                               <Navigate to="/student/dashboard"  replace />;
  }

  return children;
};

export default ProtectedRoute;