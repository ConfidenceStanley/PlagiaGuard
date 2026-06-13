// src/components/documents/DocumentDetailsModal.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  User,
  BookOpen,
  Hash,
  Type,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import Modal from "../common/Modal";
import documentService from "../../services/documentService";

const DocumentDetailsModal = ({ isOpen, onClose, documentId }) => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // info | text | stats

  const [textPage, setTextPage] = useState(1);
  const [textData, setTextData] = useState(null);
  const [loadingText, setLoadingText] = useState(false);

  // Load document info when modal opens
  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
      setActiveTab("info");
      setTextPage(1);
      setTextData(null);
    }
  }, [isOpen, documentId]);

  // Load text when text tab opens or page changes
  useEffect(() => {
    if (activeTab === "text" && doc && doc.processingStatus === "completed") {
      loadText();
    }
  }, [activeTab, textPage, doc]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const response = await documentService.getById(documentId);
      setDoc(response.data.document);
    } catch (error) {
      toast.error("Failed to load document.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const loadText = async () => {
    setLoadingText(true);
    try {
      const response = await documentService.getText(documentId, textPage, 5000);
      setTextData(response);
    } catch (error) {
      toast.error("Failed to load text.");
    } finally {
      setLoadingText(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Document Details" size="xl">
      {loading || !doc ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-start gap-4 pb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-violet-100 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {doc.title}
                </h2>
                <p className="text-sm text-slate-600 truncate">
                  {doc.originalFilename}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md uppercase">
                    {doc.fileType}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                    {doc.fileSizeFormatted}
                  </span>
                  {doc.courseCode && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                      {doc.courseCode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
              {["info", "text", "stats"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 ${
                    activeTab === tab
                      ? "text-blue-600 border-blue-600"
                      : "text-slate-600 border-transparent hover:text-slate-900"
                  }`}
                >
                  {tab === "info" && "Information"}
                  {tab === "text" && "Content"}
                  {tab === "stats" && "Statistics"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-[300px]">
            {/* ── INFO TAB ── */}
            {activeTab === "info" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <InfoRow
                  icon={Calendar}
                  label="Uploaded On"
                  value={format(new Date(doc.createdAt), "PPP 'at' p")}
                />
                {doc.uploadedBy && (
                  <InfoRow
                    icon={User}
                    label="Uploaded By"
                    value={
                      typeof doc.uploadedBy === "object"
                        ? doc.uploadedBy.full_name || doc.uploadedBy.email
                        : "You"
                    }
                  />
                )}
                {doc.assignmentTitle && (
                  <InfoRow
                    icon={BookOpen}
                    label="Assignment"
                    value={doc.assignmentTitle}
                  />
                )}
                {doc.submissionNote && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Submission Note
                    </p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">
                      {doc.submissionNote}
                    </p>
                  </div>
                )}

                {doc.cloudinaryUrl && (
                  <a
                    href={doc.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Original
                  </a>
                )}
              </motion.div>
            )}

            {/* ── TEXT TAB ── */}
            {activeTab === "text" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {loadingText ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : textData ? (
                  <>
                    <div className="bg-slate-50 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                        {textData.data.text}
                      </pre>
                    </div>

                    {/* Pagination */}
                    {textData.meta.totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setTextPage((p) => p - 1)}
                          disabled={!textData.meta.hasPrevPage}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <span className="text-sm text-slate-600">
                          Page {textData.meta.page} of {textData.meta.totalPages}
                        </span>
                        <button
                          onClick={() => setTextPage((p) => p + 1)}
                          disabled={!textData.meta.hasNextPage}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-slate-500 py-8">
                    Text not available.
                  </p>
                )}
              </motion.div>
            )}

            {/* ── STATS TAB ── */}
            {activeTab === "stats" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-4"
              >
                <StatCard
                  icon={Type}
                  label="Words"
                  value={doc.textStats?.wordCount?.toLocaleString() || 0}
                />
                <StatCard
                  icon={Hash}
                  label="Characters"
                  value={doc.textStats?.characterCount?.toLocaleString() || 0}
                />
                <StatCard
                  icon={Type}
                  label="Sentences"
                  value={doc.textStats?.sentenceCount?.toLocaleString() || 0}
                />
                <StatCard
                  icon={Type}
                  label="Paragraphs"
                  value={doc.textStats?.paragraphCount?.toLocaleString() || 0}
                />
                <StatCard
                  icon={Type}
                  label="Avg Words/Sentence"
                  value={doc.textStats?.avgWordsPerSentence || 0}
                />
                <StatCard
                  icon={Type}
                  label="Processing Time"
                  value={`${doc.processingTime || 0}ms`}
                />
              </motion.div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2 border-b border-slate-100">
    <Icon className="w-5 h-5 text-slate-400 mt-0.5" />
    <div className="flex-1">
      <p className="text-xs font-semibold text-slate-500 uppercase">{label}</p>
      <p className="text-sm text-slate-900 mt-0.5">{value}</p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-blue-500" />
      <p className="text-xs font-semibold text-slate-600 uppercase">{label}</p>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export default DocumentDetailsModal;