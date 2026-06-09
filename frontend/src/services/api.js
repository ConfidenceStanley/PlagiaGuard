import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("plagiarguard_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("plagiarguard_token");
      localStorage.removeItem("plagiarguard_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;