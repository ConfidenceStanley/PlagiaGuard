// frontend/src/pages/student/Documents.jsx
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import checkService from "../../services/checkService";
import UploadModal from "../../components/documents/UploadModal";
import DocumentCard from "../../components/documents/DocumentCard";
import DocumentDetailsModal from "../../components/documents/DocumentDetailsModal";
import DocumentFilters from "../../components/documents/DocumentFilters";
import StatsCards from "../../components/documents/StatsCards";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import ReportModal from "../../components/reports/ReportModal";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);

  // Modals
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [checkingId, setCheckingId] = useState(null);

  // ── Fetch documents ──
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await documentService.getMyDocuments(params);
      setDocuments(response.data.documents);
      setPagination(response.meta);
    } catch (error) {
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, status]);

  const loadStats = useCallback(async () => {
    try {
      const response = await documentService.getStats();
      setStats(response.data.stats);
    } catch {}
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadDocuments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadDocuments();
  }, [page, sort, status, loadDocuments]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ── Handlers ──
  const handleUploadSuccess = () => {
    loadDocuments();
    loadStats();
  };

  const handleView = (doc) => {
    setSelectedDocId(doc.id);
    setDetailsOpen(true);
  };

  const handleDelete = (doc) => setDeleteTarget(doc);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await documentService.delete(deleteTarget.id);
      toast.success("Document deleted.");
      setDeleteTarget(null);
      loadDocuments();
      loadStats();
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Plagiarism check ──
  const handleCheck = async (doc) => {
    setCheckingId(doc.id);
    const toastId = toast.loading("Running plagiarism check...");

    try {
      const response = await checkService.runCheck(doc.id);
      const score = response.data.check.overallScore;

      toast.success(`Check complete! Similarity: ${score}%`, { id: toastId });

      // Reload to show updated status
      loadDocuments();
      loadStats();

      // Auto-open the report
      setTimeout(() => {
        setSelectedDocId(doc.id);
        setReportOpen(true);
      }, 500);
    } catch (error) {
      const msg = error.response?.data?.message || "Check failed.";
      toast.error(msg, { id: toastId });
      loadDocuments();
    } finally {
      setCheckingId(null);
    }
  };

  const handleViewReport = (doc) => {
    setSelectedDocId(doc.id);
    setReportOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            My Documents
          </h1>
          <p className="text-slate-600 mt-1">Upload and check for plagiarism</p>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Upload Document
        </button>
      </motion.div>

      <StatsCards stats={stats} />

      <DocumentFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(1); }}
        sort={sort}
        onSortChange={(v) => { setSort(v); setPage(1); }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search || status ? "No matching documents" : "No documents yet"}
          description={
            search || status
              ? "Try adjusting your filters."
              : "Upload your first document to get started."
          }
          action={
            !search && !status ? (
              <button
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all"
              >
                <Plus className="w-5 h-5" />
                Upload First Document
              </button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc, idx) => (
              <DocumentCard
                key={doc.id}
                document={{
                  ...doc,
                  // override checkStatus while checking is in progress
                  checkStatus: checkingId === doc.id ? "checking" : doc.checkStatus,
                }}
                index={idx}
                onView={handleView}
                onDelete={handleDelete}
                onCheck={handleCheck}
                onViewReport={handleViewReport}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>
              <span className="px-4 text-sm text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      <DocumentDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        documentId={selectedDocId}
      />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        documentId={selectedDocId}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Document?"
        message={`"${deleteTarget?.title}" will be permanently deleted. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Documents;