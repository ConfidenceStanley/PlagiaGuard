// frontend/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Always inject the latest token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle expired tokens (smarter version) ──
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Don't auto-redirect for these cases:
    //  - login attempts (let LoginPage handle wrong password)
    //  - /me check (let AuthContext decide what to do)
    //  - already on login page
    const isAuthCheck = url.includes("/auth/me") || url.includes("/auth/login");
    const onLoginPage = window.location.pathname.includes("/login");

    if (status === 401 && !isAuthCheck && !onLoginPage) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;