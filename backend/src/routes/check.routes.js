// backend/src/routes/check.routes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  runCheck,
  getLatestCheck,
  getCheckById,
  getMyChecks,
  deleteCheck,
} = require("../controllers/check.controller");

// All routes require auth
router.use(protect);

// My check history
router.get("/", getMyChecks);

// Latest check for a specific document
router.get("/document/:documentId", getLatestCheck);

// Run a new check
router.post("/:documentId", runCheck);

// Get/Delete specific check
router.get("/:checkId", getCheckById);
router.delete("/:checkId", deleteCheck);

module.exports = router;