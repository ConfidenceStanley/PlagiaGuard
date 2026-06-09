import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on app start
  useEffect(() => {
    const savedToken = localStorage.getItem("plagiarguard_token");
    const savedUser = localStorage.getItem("plagiarguard_user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      const { access_token, user: userData } = response;

      // Save to state and localStorage
      setToken(access_token);
      setUser(userData);
      localStorage.setItem("plagiarguard_token", access_token);
      localStorage.setItem("plagiarguard_user", JSON.stringify(userData));

      toast.success(`Welcome back, ${userData.full_name}! 👋`);

      // Redirect based on role
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
        error.response?.data?.detail || "Login failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (formData) => {
    try {
      const response = await authService.register(formData);
      toast.success("Account created successfully! Please login. 🎉");
      navigate("/login");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("plagiarguard_token");
    localStorage.removeItem("plagiarguard_user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};