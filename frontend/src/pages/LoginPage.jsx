import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck, Mail, Lock, Eye, EyeOff,
  ArrowRight, Zap, Brain, BarChart3
} from "lucide-react";

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  if (isAuthenticated) {
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" />;
    if (user?.role === "lecturer") return <Navigate to="/lecturer/dashboard" />;
    return <Navigate to="/student/dashboard" />;
  }

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await login(formData.email, formData.password);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 gradient-bg-animated flex-col
                   justify-between p-12 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full
                          bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full
                          bg-violet-400/10 blur-3xl" />
        </div>

        {/* Logo */}
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

        {/* Center content */}
        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black text-white leading-tight mb-6"
          >
            Ensuring
            <span className="block text-blue-300">Academic</span>
            <span className="block">Integrity</span>
          </motion.h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-12 max-w-sm">
            Welcome back! Continue protecting academic integrity with
            AI-powered plagiarism detection.
          </p>

          {/* Features list */}
          <div className="space-y-4">
            {[
              { icon: Brain, text: "AI-Powered Paraphrase Detection" },
              { icon: Zap, text: "Results in Under 60 Seconds" },
              { icon: BarChart3, text: "Detailed Visual Reports" },
            ].map(({ icon: Icon, text }) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 text-blue-100"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center
                                justify-center border border-white/20">
                  <Icon size={16} className="text-blue-300" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-blue-300/60 text-sm relative z-10">
          © 2025 PlagiaGuard — HND Final Year Project
        </p>
      </motion.div>

      {/* ── RIGHT PANEL (Form) ──────────────────────────────── */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center p-8 bg-slate-50"
      >
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-2 justify-center mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500
                            to-violet-600 flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-800">
              Plagia<span className="text-blue-500">Guard</span>
            </span>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-black text-slate-800 mb-2">
              Welcome back 👋
            </h1>
            <p className="text-slate-500">
              Sign in to your PlagiaGuard account
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@school.edu"
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 bg-white
                             text-slate-800 placeholder-slate-400 font-medium
                             transition-all duration-200 outline-none
                             focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100
                             ${errors.email
                               ? "border-red-400 bg-red-50"
                               : "border-slate-200 hover:border-slate-300"
                             }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1.5 font-medium"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-white
                             text-slate-800 placeholder-slate-400 font-medium
                             transition-all duration-200 outline-none
                             focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100
                             ${errors.password
                               ? "border-red-400 bg-red-50"
                               : "border-slate-200 hover:border-slate-300"
                             }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1.5 font-medium"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-3
                         bg-gradient-to-r from-blue-500 to-violet-600
                         text-white py-4 rounded-2xl font-bold text-lg
                         hover:shadow-xl hover:shadow-blue-200
                         transition-all duration-300 disabled:opacity-70
                         disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white
                                  rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-400 font-medium">
                  New to PlagiaGuard?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2
                         border-2 border-slate-200 text-slate-700 py-4 rounded-2xl
                         font-semibold hover:border-blue-300 hover:text-blue-600
                         hover:bg-blue-50 transition-all duration-200"
            >
              Create a free account
              <ArrowRight size={18} />
            </Link>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;