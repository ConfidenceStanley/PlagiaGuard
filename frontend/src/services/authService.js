import api from "./api";

export const authService = {
  register: async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/api/auth/profile", data);
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get("/api/auth/notifications");
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.put("/api/auth/notifications/read-all");
    return response.data;
  },
};

export default authService;