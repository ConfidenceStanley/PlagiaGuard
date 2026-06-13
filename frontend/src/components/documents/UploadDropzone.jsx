// src/components/documents/UploadDropzone.jsx
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const MAX_SIZE_MB = 10;
const ACCEPTED_FILES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
  "text/plain": [".txt"],
};

const UploadDropzone = ({ onFileSelected, disabled = false }) => {
  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === "file-too-large") {
        toast.error(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      } else if (error.code === "file-invalid-type") {
        toast.error("Invalid file type. Use PDF, DOCX, DOC, or TXT.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILES,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    multiple: false,
    disabled,
  });

  return (
    <motion.div
      {...getRootProps()}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 cursor-pointer
        transition-all duration-200
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${
          isDragActive && !isDragReject
            ? "border-blue-500 bg-blue-50"
            : isDragReject
            ? "border-red-500 bg-red-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
        }
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center text-center">
        <motion.div
          animate={isDragActive ? { y: -5 } : { y: 0 }}
          transition={{ duration: 0.3 }}
          className={`
            p-4 rounded-2xl mb-4
            ${
              isDragReject
                ? "bg-red-100"
                : isDragActive
                ? "bg-blue-100"
                : "bg-gradient-to-br from-blue-100 to-violet-100"
            }
          `}
        >
          {isDragReject ? (
            <AlertCircle className="w-10 h-10 text-red-500" />
          ) : (
            <Upload
              className={`w-10 h-10 ${
                isDragActive ? "text-blue-600" : "text-blue-500"
              }`}
            />
          )}
        </motion.div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {isDragActive
            ? isDragReject
              ? "File type not supported"
              : "Drop your file here"
            : "Drag & drop your document"}
        </h3>

        <p className="text-sm text-slate-600 mb-4">
          or <span className="text-blue-600 font-medium">click to browse</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          {[".pdf", ".docx", ".doc", ".txt"].map((ext) => (
            <span
              key={ext}
              className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 font-medium"
            >
              {ext.toUpperCase()}
            </span>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Maximum file size: {MAX_SIZE_MB}MB
        </p>
      </div>
    </motion.div>
  );
};

export default UploadDropzone;