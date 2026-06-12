import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Create axios instance here directly to avoid any circular import
const API = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const hasFetched            = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const checkAuth = async () => {
      try {
        const res = await API.get("/api/auth/me");
        setUser(res.data.user);
      } catch {
        // 401 = not logged in = normal
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res      = await API.post("/api/auth/login", { email, password });
      const userData = res.data.user;

      setUser(userData);
      toast.success(`Welcome back, ${userData.full_name}! 👋`);

      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userData.role === "lecturer") {
        navigate("/lecturer/dashboard");
      } else {
        navigate("/student/dashboard");
      }

      return { success: true };

    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail  ||
        "Login failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (formData) => {
    try {
      await API.post("/api/auth/register", formData);
      toast.success("Account created! Please login. 🎉");
      navigate("/login");
      return { success: true };

    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail  ||
        "Registration failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await API.post("/api/auth/logout");
    } catch {
      // ignore
    } finally {
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;