// backend/src/controllers/auth.controller.js

const jwt    = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User   = require("../models/User");


// ── Cookie Options ─────────────────────────────────────────
const getCookieOptions = () => ({
  httpOnly: true,       // JS cannot read this cookie
  secure: process.env.NODE_ENV === "production",  // HTTPS only in prod
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,   // 24 hours in milliseconds
  path: "/",
});


// ── Generate JWT Token ─────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "24h" }
  );
};


// ── REGISTER ──────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      student_id,
      department,
      institution,
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const salt           = bcrypt.genSaltSync(12);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create user
    const user = await User.create({
      full_name:   full_name.trim(),
      email:       email.toLowerCase().trim(),
      password:    hashedPassword,
      role:        role || "student",
      student_id:  student_id  || null,
      department:  department  || null,
      institution: institution || null,
    });

    console.log(`✅ New user registered: ${user.email} (${user.role})`);

    // Generate token and set cookie immediately on register
    const token = generateToken(user._id);
    res.cookie("plagiarguard_token", token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: user.toPublicJSON(),
    });

  } catch (error) {
    console.error("Register error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};


// ── LOGIN ─────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 Login attempt: ${email}`);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user with password
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    console.log(`👤 User found: ${user ? "yes" : "no"}`);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    console.log(`🔑 Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact admin.",
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      last_login: new Date(),
    });

    // Generate token
    const token = generateToken(user._id);

    // Set token in HttpOnly cookie
    res.cookie("plagiarguard_token", token, getCookieOptions());

    console.log(`🎉 Login successful: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: user.toPublicJSON(),
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};


// ── LOGOUT ────────────────────────────────────────────────
// POST /api/auth/logout
const logout = async (req, res) => {
  // Clear the cookie by setting maxAge to 0
  res.cookie("plagiarguard_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 0,       // Expire immediately
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};


// ── GET CURRENT USER ──────────────────────────────────────
// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user profile.",
    });
  }
};


// ── UPDATE PROFILE ────────────────────────────────────────
// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "full_name",
      "department",
      "institution",
      "student_id",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toPublicJSON(),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};


module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
};