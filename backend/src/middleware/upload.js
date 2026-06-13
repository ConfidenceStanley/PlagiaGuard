// src/middleware/upload.js
// Multer configuration for file uploads

const multer = require("multer");
const path = require("path");
const { sendError } = require("../utils/apiResponse");

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/msword": ".doc",
  "text/plain": ".txt",
};

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];

// ─── Max file size ────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;

// ─── Storage: memory storage (we upload buffer to Cloudinary) ────────────────
const storage = multer.memoryStorage();

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const mimeAllowed = ALLOWED_MIME_TYPES[file.mimetype];
  const ext = path.extname(file.originalname).toLowerCase();
  const extAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (mimeAllowed && extAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: PDF, DOCX, DOC, TXT. Got: ${file.mimetype}`
      ),
      false
    );
  }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // One file at a time
  },
});

// ─── Middleware wrapper with proper error handling ────────────────────────────
const uploadSingle = (fieldName = "document") => {
  return (req, res, next) => {
    const multerUpload = upload.single(fieldName);

    multerUpload(req, res, (err) => {
      if (!err) return next();

      // Multer-specific errors
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return sendError(res, {
            statusCode: 400,
            message: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 10}MB.`,
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return sendError(res, {
            statusCode: 400,
            message: "Only one file can be uploaded at a time.",
          });
        }
        return sendError(res, {
          statusCode: 400,
          message: `Upload error: ${err.message}`,
        });
      }

      // File filter errors
      if (err) {
        return sendError(res, {
          statusCode: 400,
          message: err.message,
        });
      }
    });
  };
};

module.exports = { uploadSingle, ALLOWED_MIME_TYPES, MAX_FILE_SIZE };