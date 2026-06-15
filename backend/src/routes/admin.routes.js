const express = require("express");
const router = express.Router();
const { protect, requireRole } = require("../middleware/auth");
const {
  getStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getDocuments,
  deleteDocument,
  getRecentActivity,
} = require("../controllers/admin.controller");

// All admin routes require authentication + admin role
router.use(protect);
router.use(requireRole("admin"));

// Stats
router.get("/stats", getStats);

// Activity feed
router.get("/activity", getRecentActivity);

// Users
router.get("/users", getUsers);
router.patch("/users/:id", updateUserRole);
router.patch("/users/:id/toggle", toggleUserStatus);
router.delete("/users/:id", deleteUser);

// Documents
router.get("/documents", getDocuments);
router.delete("/documents/:id", deleteDocument);

module.exports = router;