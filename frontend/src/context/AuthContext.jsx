// frontend/src/context/AuthContext.jsx
// FULL REPLACEMENT

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // ← Start as TRUE so we show spinner, not redirect
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  // ── On mount: rehydrate from localStorage then verify ──
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const boot = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Immediately set from storage so UI doesn't flash
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch {}

      // Then verify with server
      try {
        const res = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const freshUser = res.data?.data?.user || res.data?.user;
        if (freshUser) {
          setUser(freshUser);
          setToken(storedToken);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      } catch (err) {
        console.warn("Token verification failed:", err.response?.status);
        // Only clear if actually unauthorized (not network error)
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setToken(null);
        }
        // If network error (503, 500) keep the stored session
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const payload = res.data?.data || res.data;
    const { token: newToken, user: newUser } = payload;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};