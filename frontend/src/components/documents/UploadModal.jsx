// src/components/documents/UploadModal.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import UploadDropzone from "./UploadDropzone";
import documentService from "../../services/documentService";

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    assignmentTitle: "",
    courseCode: "",
    submissionNote: "",
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetForm = () => {
    setFile(null);
    setFormData({
      title: "",
      assignmentTitle: "",
      courseCode: "",
      submissionNote: "",
    });
    setProgress(0);
    setUploading(false);
  };

  const handleClose = () => {
    if (uploading) {
      toast.error("Please wait for upload to complete.");
      return;
    }
    resetForm();
    onClose();
  };

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile);
    // Auto-fill title from filename (without extension)
    if (!formData.title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a document title.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const data = new FormData();
      data.append("document", file);
      data.append("title", formData.title.trim());
      if (formData.assignmentTitle.trim())
        data.append("assignmentTitle", formData.assignmentTitle.trim());
      if (formData.courseCode.trim())
        data.append("courseCode", formData.courseCode.trim());
      if (formData.submissionNote.trim())
        data.append("submissionNote", formData.submissionNote.trim());

      const response = await documentService.upload(data, (percent) => {
        setProgress(percent);
      });

      toast.success("Document uploaded successfully!");
      resetForm();
      onClose();
      if (onSuccess) onSuccess(response.data.document);
    } catch (error) {
      console.error("Upload error:", error);
      const message =
        error.response?.data?.message ||
        "Upload failed. Please check the file and try again.";
      toast.error(message);
      setUploading(false);
      setProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Document" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* File Selection or Preview */}
        {!file ? (
          <UploadDropzone onFileSelected={handleFileSelected} disabled={uploading} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-2xl"
          >
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{file.name}</p>
              <p className="text-sm text-slate-600">
                {formatFileSize(file.size)}
              </p>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            )}
          </motion.div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {progress < 100 ? "Uploading..." : "Processing document..."}
              </span>
              <span className="font-semibold text-blue-600">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
              />
            </div>
            {progress === 100 && (
              <p className="text-xs text-slate-500 italic">
                Extracting text and analyzing... (may take a few seconds)
              </p>
            )}
          </motion.div>
        )}

        {/* Metadata Form */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={uploading}
                maxLength={255}
                placeholder="e.g., Research Paper on AI Ethics"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-slate-50"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={formData.assignmentTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, assignmentTitle: e.target.value })
                  }
                  disabled={uploading}
                  placeholder="e.g., Midterm Essay"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courseCode: e.target.value.toUpperCase(),
                    })
                  }
                  disabled={uploading}
                  placeholder="e.g., CS301"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Submission Note
              </label>
              <textarea
                value={formData.submissionNote}
                onChange={(e) =>
                  setFormData({ ...formData, submissionNote: e.target.value })
                }
                disabled={uploading}
                maxLength={500}
                rows={3}
                placeholder="Optional notes about this submission..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-slate-50 resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.submissionNote.length}/500 characters
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || uploading || !formData.title.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadModal;