// src/routes/document.routes.js
const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");
const {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  getDocumentText,
  deleteDocument,
  updateDocument,
  getAllDocuments,
  getDocumentStats,
} = require("../controllers/document.controller");

// ── All routes require authentication ──
router.use(protect);

// ── Stats (must be before /:id) ──
router.get("/stats", getDocumentStats);

// ── Admin/Lecturer only ──
router.get("/all", restrictTo("admin", "lecturer"), getAllDocuments);

// ── Upload ──
router.post("/upload", uploadSingle("document"), uploadDocument);

// ── My Documents ──
router.get("/", getMyDocuments);

// ── Single Document ──
router.get("/:id", getDocumentById);
router.patch("/:id", updateDocument);
router.delete("/:id", deleteDocument);

// ── Document Text ──
router.get("/:id/text", getDocumentText);

module.exports = router;