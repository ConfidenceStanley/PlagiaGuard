// backend/src/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Never return password in queries
    },
    role: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      default: "student",
    },
    student_id: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    institution: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    profile_image: {
      type: String,
      default: null,
    },
    last_login: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// ── Return public profile (no password) ───────────────────
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    full_name: this.full_name,
    email: this.email,
    role: this.role,
    student_id: this.student_id,
    department: this.department,
    institution: this.institution,
    is_active: this.is_active,
    is_verified: this.is_verified,
    profile_image: this.profile_image,
    created_at: this.created_at,
    last_login: this.last_login,
  };
};

module.exports = mongoose.model("User", userSchema);