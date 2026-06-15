import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  Upload,
  Shield,
} from "lucide-react";
import api from "../../services/api";
import { formatDistanceToNow } from "date-fns";

// ─── Stat Card Component ───────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </motion.div>
  );
}

// ─── Role Badge ────────────────────────────────────────────────
function RoleBadge({ role }) {
  const styles = {
    student: "bg-blue-100 text-blue-700",
    lecturer: "bg-violet-100 text-violet-700",
    admin: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[role] || "bg-slate-100 text-slate-600"
      }`}
    >
      {role}
    </span>
  );
}

// ─── Safe Date Helper ──────────────────────────────────────────
function safeTimeAgo(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

// ─── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/activity"),
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data.activity || []);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-blue-500",
      sub: `${stats?.userBreakdown?.student ?? 0} students · ${
        stats?.userBreakdown?.lecturer ?? 0
      } lecturers`,
      delay: 0,
    },
    {
      label: "Total Documents",
      value: stats?.totalDocuments ?? 0,
      icon: FileText,
      color: "bg-violet-500",
      sub: "All uploaded files",
      delay: 0.05,
    },
    {
      label: "High Risk Submissions",
      value: stats?.highRiskCount ?? 0,
      icon: AlertTriangle,
      color: "bg-rose-500",
      sub: "High + Critical risk level",
      delay: 0.1,
    },
    {
      label: "Uploads Today",
      value: stats?.todayUploads ?? 0,
      icon: Upload,
      color: "bg-emerald-500",
      sub: "Since midnight",
      delay: 0.15,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl">
            <Shield size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <p className="text-slate-500 ml-12">
          System overview and recent activity
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* User Breakdown + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-slate-400" />
            <h2 className="font-semibold text-slate-800">User Breakdown</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                role: "Students",
                count: stats?.userBreakdown?.student ?? 0,
                color: "bg-blue-500",
                total: stats?.totalUsers,
              },
              {
                role: "Lecturers",
                count: stats?.userBreakdown?.lecturer ?? 0,
                color: "bg-violet-500",
                total: stats?.totalUsers,
              },
              {
                role: "Admins",
                count: stats?.userBreakdown?.admin ?? 0,
                color: "bg-rose-500",
                total: stats?.totalUsers,
              },
            ].map(({ role, count, color, total }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{role}</span>
                    <span className="font-medium text-slate-800">
                      {count}
                      <span className="text-slate-400 font-normal ml-1">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-slate-400" />
            <h2 className="font-semibold text-slate-800">Recent Activity</h2>
          </div>

          {activity.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock size={32} className="mx-auto mb-2 opacity-30" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {item.user?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-800 truncate">
                        {item.user?.full_name ?? "Unknown"}
                      </span>
                      <RoleBadge role={item.user?.role} />
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      Uploaded{" "}
                      <span className="font-medium text-slate-700">
                        {item.document?.title || item.document?.originalFilename}
                      </span>
                    </p>
                  </div>

                  {/* Time */}
                  <div className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    {safeTimeAgo(item.createdAt)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}