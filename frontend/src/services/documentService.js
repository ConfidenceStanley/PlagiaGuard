// src/services/documentService.js
import api from "./api";

const documentService = {
  /**
   * Upload a document with progress tracking
   * @param {FormData} formData     - Form data with file + metadata
   * @param {Function} onProgress   - Progress callback (0-100)
   */
  upload: async (formData, onProgress) => {
    const response = await api.post("/api/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  /**
   * Get user's documents with filters/pagination
   */
  getMyDocuments: async (params = {}) => {
    const response = await api.get("/api/documents", { params });
    return response.data;
  },

  /**
   * Get single document by ID
   */
  getById: async (id) => {
    const response = await api.get(`/api/documents/${id}`);
    return response.data;
  },

  /**
   * Get extracted text (paginated)
   */
  getText: async (id, page = 1, charsPerPage = 5000) => {
    const response = await api.get(`/api/documents/${id}/text`, {
      params: { page, charsPerPage },
    });
    return response.data;
  },

  /**
   * Update document metadata
   */
  update: async (id, data) => {
    const response = await api.patch(`/api/documents/${id}`, data);
    return response.data;
  },

  /**
   * Delete document (soft delete)
   */
  delete: async (id) => {
    const response = await api.delete(`/api/documents/${id}`);
    return response.data;
  },

  /**
   * Get user stats
   */
  getStats: async () => {
    const response = await api.get("/api/documents/stats");
    return response.data;
  },

  /**
   * Get all documents (admin/lecturer only)
   */
  getAllDocuments: async (params = {}) => {
    const response = await api.get("/api/documents/all", { params });
    return response.data;
  },
};

export default documentService;