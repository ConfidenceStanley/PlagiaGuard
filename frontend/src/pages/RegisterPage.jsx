import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck, Mail, Lock, Eye, EyeOff,
  User, Hash, BookOpen, ArrowRight, CheckCircle
} from "lucide-react";

const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Electrical Engineering",
  "Business Administration",
  "Accounting",
  "Mass Communication",
  "Civil Engineering",
  "Mechanical Engineering",
  "Other",
];

const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { strength: 1, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { strength: 2, label: "Fair", color: "#f59e0b" };
  if (score <= 3) return { strength: 3, label: "Good", color: "#3b82f6" };
  return { strength: 4, label: "Strong", color: "#10b981" };
};

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    student_id: "",
    department: "",
    institution: "PlagiaGuard Institution",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) return <Navigate to="/student/dashboard" />;

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name || formData.full_name.length < 2)
      newErrors.full_name = "Full name must be at least 2 characters";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email address";
    if (!formData.password || formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.department)
      newErrors.department = "Please select your department";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// Find this in RegisterPage.jsx:

// Replace with:
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true);
  try {
    const { confirmPassword, ...submitData } = formData;
    const newUser = await register(submitData);

    // Redirect based on role
    if (newUser.role === "admin") {
      window.location.replace("/admin/dashboard");
    } else if (newUser.role === "lecturer") {
      window.location.replace("/lecturer/dashboard");
    } else {
      window.location.replace("/student/dashboard");
    }
  } catch (err) {
    console.error("Register failed:", err);
    toast.error(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const inputClass = (field) => `
    w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 bg-white
    text-slate-800 placeholder-slate-400 font-medium text-sm
    transition-all duration-200 outline-none
    focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100
    ${errors[field]
      ? "border-red-400 bg-red-50"
      : "border-slate-200 hover:border-slate-300"
    }
  `;

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-2/5 gradient-bg-animated flex-col
                   justify-between p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full
                          bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full
                          bg-violet-400/10 blur-3xl" />
        </div>

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm
                          flex items-center justify-center border border-white/30">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">Plagia</span>
            <span className="text-2xl font-black text-blue-300">Guard</span>
          </div>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-6">
            Join Thousands
            <span className="block text-blue-300">of Students</span>
            <span className="block">& Lecturers</span>
          </h2>
          <p className="text-blue-200 text-base leading-relaxed mb-10">
            Create your free account and start checking academic documents
            for plagiarism with advanced AI technology.
          </p>

          {/* Benefit list */}
          <div className="space-y-4">
            {[
              "Free forever — no credit card needed",
              "Check unlimited documents",
              "AI-powered paraphrase detection",
              "Downloadable PDF reports",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-blue-100">
                <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300/60 text-sm relative z-10">
          © 2025 PlagiaGuard — HND Final Year Project
        </p>
      </motion.div>

      {/* ── RIGHT PANEL (Form) ──────────────────────────────── */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center p-8 overflow-y-auto"
      >
        <div className="w-full max-w-lg py-8">

          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-2 justify-center mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500
                            to-violet-600 flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-800">
              Plagia<span className="text-blue-500">Guard</span>
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-black text-slate-800 mb-2">
              Create your account
            </h1>
            <p className="text-slate-500">
              Join PlagiaGuard and protect academic integrity
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2
                                           text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClass("full_name")}
                />
              </div>
              {errors.full_name && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2
                                           text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@school.edu"
                  className={inputClass("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  I am a
                </label>
                <div className="flex rounded-2xl border-2 border-slate-200
                                overflow-hidden bg-white">
                  {["student", "lecturer"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role }))
                      }
                      className={`flex-1 py-3.5 text-sm font-semibold capitalize
                                 transition-all duration-200
                                 ${formData.role === role
                                   ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white"
                                   : "text-slate-500 hover:bg-slate-50"
                                 }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <BookOpen size={17} className="absolute left-4 top-1/2
                                                  -translate-y-1/2 text-slate-400
                                                  pointer-events-none z-10" />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`${inputClass("department")} appearance-none cursor-pointer`}
                  >
                    <option value="">Select...</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.department}
                  </p>
                )}
              </div>
            </div>

            {/* Student ID (conditional) */}
            {formData.role === "student" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Student ID
                  <span className="text-slate-400 font-normal ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <Hash size={17} className="absolute left-4 top-1/2 -translate-y-1/2
                                              text-slate-400" />
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    placeholder="e.g. HND/2024/001"
                    className={inputClass("student_id")}
                  />
                </div>
              </motion.div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2
                                           text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className={`${inputClass("password")} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Password strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : "#e2e8f0",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label} password
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2
                                           text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`${inputClass("confirmPassword")} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {/* Match indicator */}
              {formData.confirmPassword && formData.password && (
                <p
                  className={`text-xs mt-1 font-medium flex items-center gap-1
                               ${formData.password === formData.confirmPassword
                                 ? "text-emerald-500"
                                 : "text-red-500"
                               }`}
                >
                  <CheckCircle size={12} />
                  {formData.password === formData.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-3
                         bg-gradient-to-r from-blue-500 to-violet-600
                         text-white py-4 rounded-2xl font-bold text-base
                         hover:shadow-xl hover:shadow-blue-200
                         transition-all duration-300 disabled:opacity-70
                         disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white
                                  rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>

            {/* Login link */}
            <p className="text-center text-slate-500 text-sm pt-2">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-700
                           transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;