// frontend/src/pages/lecturer/SubmissionsPage.jsx

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

// ─── Risk badge ─────────────────────────────────────────────
const RiskBadge = ({ level }) => {
  const config = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
        config[level] || "bg-slate-100 text-slate-600"
      }`}
    >
      {level || "—"}
    </span>
  );
};

// ─── Score bar ──────────────────────────────────────────────
const ScoreBar = ({ score }) => {
  const color =
    score >= 75
      ? "bg-red-500"
      : score >= 50
      ? "bg-orange-400"
      : score >= 25
      ? "bg-amber-400"
      : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-slate-800 tabular-nums">
        {score}%
      </span>
    </div>
  );
};

// ─── Filter pill ────────────────────────────────────────────
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
      active
        ? "bg-blue-500 text-white shadow-sm"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`}
  >
    {label}
  </button>
);

// ─── Helper: extract score from check (handles both naming styles) ──
const getCheckScore = (check) => check?.overallScore ?? 0;
const getCheckRisk = (check) => check?.riskLevel;

// ─── Main page ──────────────────────────────────────────────
const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // ── Fetch submissions ──
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get("/api/lecturer/submissions");
        setSubmissions(res.data.submissions || []);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
        toast.error("Could not load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  // ── Filter + search ──
  const filtered = useMemo(() => {
    let result = submissions;

    // Risk filter
    if (riskFilter === "high") {
      result = result.filter((s) => getCheckScore(s.latestCheck) >= 50);
    } else if (riskFilter === "safe") {
      result = result.filter(
        (s) => s.latestCheck && getCheckScore(s.latestCheck) < 50
      );
    } else if (riskFilter === "unchecked") {
      result = result.filter((s) => !s.latestCheck);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.originalFilename?.toLowerCase().includes(q) ||
          s.uploadedBy?.full_name?.toLowerCase().includes(q) ||
          s.uploadedBy?.email?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [submissions, riskFilter, search]);

  // ── Pagination ──
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
    setPage(1);
  }, [search, riskFilter]);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">All Submissions</h1>
        <p className="text-slate-500 mt-1">
          {submissions.length} total student documents
        </p>
      </motion.div>

      {/* ─── Toolbar ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, email, or document…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {[
            { key: "all", label: "All" },
            { key: "high", label: "🔴 High Risk" },
            { key: "safe", label: "✅ Safe" },
            { key: "unchecked", label: "⏳ Unchecked" },
          ].map((f) => (
            <FilterPill
              key={f.key}
              label={f.label}
              active={riskFilter === f.key}
              onClick={() => setRiskFilter(f.key)}
            />
          ))}
        </div>
      </motion.div>

      {/* ─── Table ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide border-b border-slate-100">
                <th className="text-left px-6 py-3 font-semibold">Student</th>
                <th className="text-left px-6 py-3 font-semibold">Document</th>
                <th className="text-left px-6 py-3 font-semibold">Score</th>
                <th className="text-left px-6 py-3 font-semibold">Risk</th>
                <th className="text-left px-6 py-3 font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                      No submissions found
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Try adjusting your search or filter
                    </p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {paginated.map((sub, idx) => {
                    const score = getCheckScore(sub.latestCheck);
                    const risk = getCheckRisk(sub.latestCheck);

                    return (
                      <motion.tr
                        key={sub._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Student */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            {sub.uploadedBy?.full_name || "—"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {sub.uploadedBy?.email || ""}
                          </p>
                        </td>

                        {/* Document */}
                        <td className="px-6 py-4 max-w-[220px]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate text-slate-700">
                              {sub.title || sub.originalFilename}
                            </span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4">
                          {sub.latestCheck ? (
                            <ScoreBar score={score} />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              Not checked
                            </span>
                          )}
                        </td>

                        {/* Risk */}
                        <td className="px-6 py-4">
                          {sub.latestCheck ? (
                            <RiskBadge level={risk} />
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ─── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * itemsPerPage + 1}–
              {Math.min(page * itemsPerPage, filtered.length)} of{" "}
              {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600 font-medium px-2">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SubmissionsPage;