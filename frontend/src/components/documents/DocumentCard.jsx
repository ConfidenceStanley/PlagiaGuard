// frontend/src/components/documents/DocumentCard.jsx
import { motion } from "framer-motion";
import {
  FileText,
  FileType,
  Calendar,
  MoreVertical,
  Eye,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ScanSearch,      // ← NEW icon
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const fileTypeColors = {
  pdf: "bg-red-50 text-red-600",
  docx: "bg-blue-50 text-blue-600",
  doc: "bg-blue-50 text-blue-600",
  txt: "bg-slate-100 text-slate-600",
};

const statusConfig = {
  unchecked: { label: "Not Checked", color: "bg-slate-100 text-slate-600", icon: Clock },
  checking:  { label: "Checking...", color: "bg-blue-50 text-blue-600", icon: Clock },
  checked:   { label: "Checked", color: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
  error:     { label: "Error", color: "bg-red-50 text-red-600", icon: AlertTriangle },
};

const DocumentCard = ({
  document,
  onView,
  onDelete,
  onCheck,       // ← NEW prop
  onViewReport,  // ← NEW prop
  index = 0,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const status = statusConfig[document.checkStatus] || statusConfig.unchecked;
  const StatusIcon = status.icon;

  const score = document.plagiarismScore;
  const scoreColor =
    score === null
      ? "text-slate-400"
      : score >= 70
      ? "text-red-600"
      : score >= 40
      ? "text-amber-600"
      : "text-emerald-600";

  const isChecking = document.checkStatus === "checking";
  const isChecked = document.checkStatus === "checked";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="relative bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 p-5 transition-all flex flex-col"
    >
      {/* File Icon + Menu */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${fileTypeColors[document.fileType]}`}>
          <FileText className="w-6 h-6" />
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-600" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-10 z-20 w-44 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onView(document);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
                {document.cloudinaryUrl && (
                  <a
                    href={document.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(document);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Title & Metadata */}
      <div onClick={() => onView(document)} className="cursor-pointer flex-1">
        <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">
          {document.title}
        </h3>

        {document.courseCode && (
          <p className="text-xs text-blue-600 font-medium mb-2">
            {document.courseCode}
          </p>
        )}

        <p className="text-xs text-slate-500 mb-4 truncate">
          {document.originalFilename}
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100">
          <span className="flex items-center gap-1">
            <FileType className="w-3.5 h-3.5" />
            {document.fileSizeFormatted}
          </span>
          <span>{document.textStats?.wordCount || 0} words</span>
        </div>

        {/* Status + Score + Date */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${status.color}`}
          >
            <StatusIcon className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
            {status.label}
          </span>

          <div className="text-right">
            {score !== null && (
              <p className={`text-sm font-bold ${scoreColor}`}>
                {score.toFixed(1)}%
              </p>
            )}
            <p className="text-[10px] text-slate-500 flex items-center gap-1 justify-end mt-0.5">
              <Calendar className="w-3 h-3" />
              {format(new Date(document.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Action Button ── */}
      {isChecked ? (
        <button
          onClick={() => onViewReport(document)}
          className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Eye className="w-4 h-4" />
          View Report
        </button>
      ) : (
        <button
          onClick={() => onCheck(document)}
          disabled={isChecking}
          className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          {isChecking ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <ScanSearch className="w-4 h-4" />
              Check Plagiarism
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};

export default DocumentCard;