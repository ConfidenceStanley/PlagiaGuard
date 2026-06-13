// backend/src/middleware/auth.js

const jwt  = require("jsonwebtoken");
const User = require("../models/User");


const protect = async (req, res, next) => {
  try {
    let token = null;

    // ── 1. Check HttpOnly cookie first (preferred) ─────────
    if (req.cookies && req.cookies.plagiarguard_token) {
      token = req.cookies.plagiarguard_token;
      console.log("🍪 Token from cookie");
    }

    // ── 2. Fall back to Authorization header ───────────────
    //    (useful for Postman testing)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("🔑 Token from Authorization header");
    }

    // ── 3. No token found ──────────────────────────────────
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please log in.",
      });
    }

    // ── 4. Verify token ────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── 5. Find user ───────────────────────────────────────
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // ── 6. Attach user to request ──────────────────────────
    req.user = user;
    next();

  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }
    next(error);
  }
};


// ── Role-Based Access Control ──────────────────────────────────────────────────

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access restricted. Required: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

// ── Named convenience middlewares ──────────────────────────────────────────────
const requireStudent         = requireRole("student");
const requireLecturer        = requireRole("lecturer");
const requireAdmin           = requireRole("admin");
const requireLecturerOrAdmin = requireRole("lecturer", "admin");

// ── Alias: "restrictTo" used in document.routes.js ────────────────────────────
// Same function, different name — both work identically
const restrictTo = requireRole;


module.exports = {
  protect,
  requireRole,
  restrictTo,             // ← used in document.routes.js
  requireStudent,
  requireLecturer,
  requireAdmin,
  requireLecturerOrAdmin,
};