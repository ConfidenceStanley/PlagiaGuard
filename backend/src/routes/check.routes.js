// backend/src/routes/check.routes.js
const express = require("express");
const router = express.Router();

// ✅ CORRECT path — matches your actual file location
const { protect, restrictTo } = require("../middleware/auth");
const {
  runCheck,
  getLatestCheck,
  getCheckById,
  getMyChecks,
  deleteCheck,
} = require("../controllers/check.controller");

// ── All routes require authentication ──
router.use(protect);

// ── Run a new check ──
router.post("/:documentId", runCheck);

// ── Get check history for current user ──
router.get("/", getMyChecks);

// ── Get latest check for a document ──
router.get("/document/:documentId", getLatestCheck);

// ── Get single check by ID ──
router.get("/:checkId", getCheckById);

// ── Delete a check ──
router.delete("/:checkId", restrictTo("admin"), deleteCheck);

module.exports = router;