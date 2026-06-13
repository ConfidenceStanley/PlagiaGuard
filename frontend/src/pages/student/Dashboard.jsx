// src/pages/student/Dashboard.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  Upload,
  ArrowRight,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import documentService from "../../services/documentService";
import StatsCards from "../../components/documents/StatsCards";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);

  useEffect(() => {
    documentService.getStats().then((r) => setStats(r.data.stats)).catch(() => {});
    documentService
      .getMyDocuments({ limit: 3 })
      .then((r) => setRecentDocs(r.data.documents))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Welcome ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-2">
          <Sparkles className="w-4 h-4" />
          Welcome back
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Hello, {user?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-600 mt-1">
          Here's what's happening with your documents.
        </p>
      </motion.div>

      {/* ── Stats ── */}
      <StatsCards stats={stats} />

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link to="/student/documents">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 cursor-pointer h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Upload className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 opacity-50" />
            </div>
            <h3 className="text-lg font-bold mb-1">Upload Document</h3>
            <p className="text-sm text-white/80">
              Add a new document for plagiarism check
            </p>
          </motion.div>
        </Link>

        <Link to="/student/documents">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-violet-50 rounded-xl">
                <FolderOpen className="w-6 h-6 text-violet-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold mb-1 text-slate-900">
              Browse Documents
            </h3>
            <p className="text-sm text-slate-600">
              View and manage your uploaded documents
            </p>
          </motion.div>
        </Link>
      </div>

      {/* ── Recent Documents ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Documents</h2>
          <Link
            to="/student/documents"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No documents yet</p>
            <Link
              to="/student/documents"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload your first document
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDocs.map((doc) => (
              <Link
                key={doc.id}
                to="/student/documents"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate text-sm">
                    {doc.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {doc.fileSizeFormatted} • {doc.textStats?.wordCount || 0} words
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;