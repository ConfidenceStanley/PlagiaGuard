// frontend/src/services/checkService.js
import api from "./api";

const checkService = {
  /**
   * Run a plagiarism check on a document
   */
  runCheck: async (documentId) => {
    const response = await api.post(`/api/checks/${documentId}`);
    return response.data;
  },

  /**
   * Get the latest check for a document
   */
  getLatestForDocument: async (documentId) => {
    const response = await api.get(`/api/checks/document/${documentId}`);
    return response.data;
  },

  /**
   * Get a specific check by ID
   */
  getById: async (checkId) => {
    const response = await api.get(`/api/checks/${checkId}`);
    return response.data;
  },

  /**
   * Get my check history
   */
  getMyChecks: async (params = {}) => {
    const response = await api.get("/api/checks", { params });
    return response.data;
  },

  /**
   * Delete a check
   */
  delete: async (checkId) => {
    const response = await api.delete(`/api/checks/${checkId}`);
    return response.data;
  },
};

export default checkService;