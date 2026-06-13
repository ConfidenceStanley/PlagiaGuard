// backend/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

// ✅ CORRECT path
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;