// frontend/src/pages/lecturer/Dashboard.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

// ─── Stat card ──────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
  </motion.div>
);

// ─── Risk badge ─────────────────────────────────────────
const RiskBadge = ({ level }) => {
  const styles = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
        styles[level] || "bg-slate-100 text-slate-600"
      }`}
    >
      {level || "—"}
    </span>
  );
};

// ─── Main dashboard ─────────────────────────────────────
const LecturerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [highRisk, setHighRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, highRiskRes] = await Promise.all([
          api.get("/api/lecturer/stats"),
          api.get("/api/lecturer/high-risk"),
        ]);
        setStats(statsRes.data);
        setHighRisk((highRiskRes.data.highRisk || []).slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── Loading skeleton ─────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-slate-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">
          Lecturer Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Monitor student submissions and plagiarism activity
        </p>
      </motion.div>

      {/* ─── Stat cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Documents"
          value={stats?.totalDocs ?? 0}
          icon={FileText}
          color="bg-blue-500"
          delay={0.05}
        />
        <StatCard
          label="High Risk"
          value={stats?.highRiskCount ?? 0}
          icon={AlertTriangle}
          color="bg-red-500"
          delay={0.1}
        />
        <StatCard
          label="Average Score"
          value={`${stats?.avgScore ?? 0}%`}
          icon={TrendingUp}
          color="bg-violet-500"
          delay={0.15}
        />
        <StatCard
          label="Uploaded Today"
          value={stats?.docsToday ?? 0}
          icon={Clock}
          color="bg-emerald-500"
          delay={0.2}
        />
      </div>

      {/* ─── High Risk Table ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold text-slate-900">
              High Risk Submissions
            </h2>
            {highRisk.length > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                {highRisk.length}
              </span>
            )}
          </div>
          <Link
            to="/lecturer/submissions"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Empty state */}
        {highRisk.length === 0 ? (
          <div className="py-16 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              No high risk submissions
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Documents with 50%+ plagiarism will appear here
            </p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-semibold">Student</th>
                  <th className="text-left px-6 py-3 font-semibold">
                    Document
                  </th>
                  <th className="text-left px-6 py-3 font-semibold">Score</th>
                  <th className="text-left px-6 py-3 font-semibold">Risk</th>
                  <th className="text-left px-6 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {highRisk.map((item) => {
                  const score = item.overallScore ?? 0;
                  const risk = item.riskLevel;
                  const doc = item.document;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Student */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {doc?.uploadedBy?.full_name || "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {doc?.uploadedBy?.email || ""}
                        </p>
                      </td>

                      {/* Document name */}
                      <td className="px-6 py-4 max-w-[200px]">
                        <p className="truncate text-slate-700">
                          {doc?.title || doc?.originalFilename || "—"}
                        </p>
                      </td>

                      {/* Score with bar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score >= 75
                                  ? "bg-red-500"
                                  : score >= 50
                                  ? "bg-orange-400"
                                  : "bg-amber-400"
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-800 tabular-nums">
                            {score}%
                          </span>
                        </div>
                      </td>

                      {/* Risk badge */}
                      <td className="px-6 py-4">
                        <RiskBadge level={risk} />
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LecturerDashboard;