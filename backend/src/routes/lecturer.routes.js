const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const {
  getStats,
  getSubmissions,
  getHighRisk,
  getDocumentCheck,
} = require("../controllers/lecturer.controller");

// All routes require login + lecturer or admin role
router.use(protect);
router.use(requireRole("lecturer", "admin"));

router.get("/stats", getStats);
router.get("/submissions", getSubmissions);
router.get("/high-risk", getHighRisk);
router.get("/checks/:docId", getDocumentCheck);

module.exports = router;