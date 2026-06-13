// frontend/src/components/reports/ReportModal.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  User,
  Loader2,
  Shield,
  AlertCircle,
  ExternalLink,
  Globe,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import checkService from "../../services/checkService";

const ReportModal = ({ isOpen, onClose, documentId }) => {
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSource, setExpandedSource] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadCheck();
    }
  }, [isOpen, documentId]);

  const loadCheck = async () => {
    setLoading(true);
    try {
      const response = await checkService.getLatestForDocument(documentId);
      setCheck(response.data.check);
    } catch (error) {
      toast.error("Failed to load report.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plagiarism Report" size="xl">
      {loading || !check ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="p-6">
          {/* ── Document Header ── */}
          <div className="mb-6 pb-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {check.documentTitle}
            </h2>
            <p className="text-sm text-slate-500">
              Checked on {format(new Date(check.createdAt), "PPP 'at' p")}
            </p>
          </div>

          {/* ── Overall Score Hero ── */}
          <RiskHero check={check} />

          {/* ── Quick Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
            <StatBox
              label="Originality"
              value={`${Math.max(0, Math.round((100 - check.overallScore) * 10) / 10)}%`}
              icon={Shield}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <StatBox
              label="Local Matches"
              value={check.matchedSourcesCount}
              icon={FileText}
              color="text-violet-600"
              bg="bg-violet-50"
            />
            <StatBox
              label="Web Matches"
              value={check.webSources?.length || 0}
              icon={Globe}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <StatBox
              label="Check Time"
              value={`${(check.processingTime / 1000).toFixed(1)}s`}
              icon={Clock}
              color="text-slate-600"
              bg="bg-slate-50"
            />
          </div>

          {/* ── Matched Sources ── */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {check.matchedSourcesCount > 0
                ? `Matched Sources (${check.matchedSourcesCount})`
                : "No Matches Found"}
            </h3>

            {check.sources && check.sources.length > 0 ? (
              <div className="space-y-3">
                {check.sources.map((source, idx) => (
                  <SourceMatch
                    key={idx}
                    source={source}
                    index={idx}
                    isExpanded={expandedSource === idx}
                    onToggle={() =>
                      setExpandedSource(expandedSource === idx ? null : idx)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-emerald-50 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-emerald-700 font-medium">
                  Great! No significant matches found.
                </p>
                <p className="text-sm text-emerald-600 mt-1">
                  Your document appears to be original.
                </p>
              </div>
            )}
          </div>

          {/* ── Web Sources ── */}
          {check.webSearchEnabled && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Web Sources Found ({check.webSources?.length || 0})
                </h3>
                <span className="text-xs text-slate-500">
                  {check.webQueriesUsed} queries ·{" "}
                  {(check.webSearchTime / 1000).toFixed(1)}s
                </span>
              </div>

              {check.webSources && check.webSources.length > 0 ? (
                <div className="space-y-3">
                  {check.webSources.map((source, idx) => (
                    <WebSourceCard key={idx} source={source} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-emerald-50 rounded-2xl">
                  <Globe className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-emerald-700 font-medium">
                    No matches found on the web
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    Document content appears to be original online.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

// ── Risk Hero ──
const RiskHero = ({ check }) => {
  const configs = {
    low: {
      gradient: "from-emerald-500 to-emerald-600",
      icon: CheckCircle2,
      label: "Low Risk",
      desc: "Your document appears to be largely original.",
    },
    medium: {
      gradient: "from-amber-500 to-amber-600",
      icon: AlertCircle,
      label: "Medium Risk",
      desc: "Some similarities detected. Review the matches below.",
    },
    high: {
      gradient: "from-orange-500 to-orange-600",
      icon: AlertTriangle,
      label: "High Risk",
      desc: "Significant similarities found. Careful review needed.",
    },
    critical: {
      gradient: "from-red-500 to-red-600",
      icon: AlertTriangle,
      label: "Critical Risk",
      desc: "Very high similarity detected. May be plagiarized.",
    },
  };

  const config = configs[check.riskLevel] || configs.low;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${config.gradient} rounded-2xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-white/80 uppercase font-semibold mb-1">
            {config.label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{check.overallScore}%</span>
            <span className="text-sm text-white/80">similarity</span>
          </div>
          <p className="text-sm text-white/90 mt-2">{config.desc}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ── Stat Box ──
const StatBox = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-3">
    <div className={`p-2 rounded-lg ${bg} inline-block mb-2`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className="text-xs text-slate-500 font-medium">{label}</p>
    <p className="text-lg font-bold text-slate-900">{value}</p>
  </div>
);

// ── Source Match ──
const SourceMatch = ({ source, index, isExpanded, onToggle }) => {
  const sim = source.overallSimilarity;

  const getColorClasses = (s) => {
    if (s >= 70)
      return {
        text: "text-red-600",
        bar: "from-red-400 to-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
      };
    if (s >= 50)
      return {
        text: "text-orange-600",
        bar: "from-orange-400 to-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
      };
    if (s >= 30)
      return {
        text: "text-amber-600",
        bar: "from-amber-400 to-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    return {
      text: "text-blue-600",
      bar: "from-blue-400 to-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    };
  };

  const colors = getColorClasses(sim);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-slate-200 rounded-2xl overflow-hidden bg-white"
    >
      {/* Header */}
      <div
        onClick={onToggle}
        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 truncate">
              {source.sourceTitle}
            </h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              {source.sourceUploaderName}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${colors.text}`}>
              {sim.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500 uppercase">similar</p>
          </div>
        </div>

        {/* Similarity Bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sim}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`h-full bg-gradient-to-r ${colors.bar}`}
          />
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
          <span>{source.matchedSegments?.length || 0} segments</span>
          <span>{source.matchedWordCount || 0} matched words</span>
          <span>{source.matchPercentage}% of document</span>
        </div>
      </div>

      {/* Expanded: Matched Segments */}
      {isExpanded && source.matchedSegments?.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-slate-200 bg-slate-50"
        >
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-700 uppercase">
              Matched Text Segments
            </p>
            {source.matchedSegments.map((seg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border ${colors.bg} ${colors.border}`}
              >
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "{seg.text}"
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {seg.wordCount} words
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ── Web Source Card ──
const WebSourceCard = ({ source, index }) => {
  const [expanded, setExpanded] = useState(false);

  let domain = "Unknown";
  try {
    domain = new URL(source.sourceUrl).hostname.replace("www.", "");
  } catch {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-slate-200 rounded-2xl overflow-hidden bg-white"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-xs font-medium text-blue-600">{domain}</span>
            </div>
            <h4 className="font-semibold text-slate-900 line-clamp-2 mb-1">
              {source.sourceTitle}
            </h4>
            <a
              href={source.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 truncate"
            >
              {source.sourceUrl}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="inline-block px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md">
              {source.matchedPhrasesCount} matches
            </span>
          </div>
        </div>

        {source.sourceSnippet && (
          <p className="text-sm text-slate-600 italic line-clamp-2 mt-2">
            "{source.sourceSnippet}"
          </p>
        )}

        {source.matchedPhrases && source.matchedPhrases.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-3"
          >
            {expanded ? "Hide" : "Show"} matched phrases →
          </button>
        )}

        {expanded && source.matchedPhrases && (
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
            {source.matchedPhrases.map((phrase, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-red-50 border border-red-200"
              >
                <p className="text-xs font-semibold text-red-700 mb-1">
                  From your document:
                </p>
                <p className="text-sm text-slate-700 italic">
                  "{phrase.phrase}"
                </p>
                <p className="text-xs font-semibold text-red-700 mt-2 mb-1">
                  Found online ({phrase.overlap}% overlap):
                </p>
                <p className="text-sm text-slate-700 italic">
                  "{phrase.snippet}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReportModal;