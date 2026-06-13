// backend/src/controllers/check.controller.js
const Document = require("../models/Document");
const PlagiarismCheck = require("../models/PlagiarismCheck");
const { detectPlagiarism } = require("../services/detection.service");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// ─── Run Plagiarism Check ─────────────────────────────────────────────────────

/**
 * POST /api/checks/:documentId
 * Run a new plagiarism check on a document
 */
const runCheck = async (req, res) => {
  const { documentId } = req.params;

  try {
    // 1. Verify document exists and user has access
    const document = await Document.findById(documentId);

    if (!document) {
      return sendError(res, { statusCode: 404, message: "Document not found." });
    }

    // Access: student can only check own docs; lecturer/admin can check any
    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    const isPrivileged = ["lecturer", "admin"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return sendError(res, { statusCode: 403, message: "Access denied." });
    }

    if (document.processingStatus !== "completed") {
      return sendError(res, {
        statusCode: 422,
        message: `Document is ${document.processingStatus}. Wait for processing to complete.`,
      });
    }

    // 2. Mark document as checking
    document.checkStatus = "checking";
    await document.save();

    try {
      // 3. Run detection
      const result = await detectPlagiarism(documentId, {
        minSimilarityThreshold: 25,
        maxSourcesReturned: 10,
        minMatchedWords: 8,
      });

      // 4. Save check record
      const check = await PlagiarismCheck.create({
        documentId: document._id,
        documentTitle: document.title,
        checkedBy: req.user._id,
        overallScore: result.overallScore,
        riskLevel: result.riskLevel,
        sources: result.sources,
        webSources: result.webSources,           // ← NEW
        webSearchEnabled: result.webSearchEnabled, // ← NEW
        webQueriesUsed: result.webQueriesUsed,    // ← NEW
        webSearchTime: result.webSearchTime,      // ← NEW
        totalSourcesScanned: result.totalSourcesScanned,
        matchedSourcesCount: result.matchedSourcesCount,
        totalMatchedSegments: result.totalMatchedSegments,
        uniqueContentPercentage: result.uniqueContentPercentage,
        processingTime: result.processingTime,
        status: "completed",
    });

      // 5. Update document with check results
      document.checkStatus = "checked";
      document.plagiarismScore = result.overallScore;
      document.lastChecked = new Date();
      await document.save();

      return sendSuccess(res, {
        statusCode: 200,
        message: "Plagiarism check completed.",
        data: {
          check: formatCheckResponse(check),
        },
      });
    } catch (detectionError) {
      // Mark document as error
      document.checkStatus = "error";
      await document.save();
      throw detectionError;
    }
  } catch (error) {
    console.error("❌ Check error:", error.message);

    if (error.name === "CastError") {
      return sendError(res, { statusCode: 400, message: "Invalid document ID." });
    }

    return sendError(res, {
      statusCode: 500,
      message: error.message || "Plagiarism check failed.",
    });
  }
};

// ─── Get Latest Check for Document ────────────────────────────────────────────

/**
 * GET /api/checks/document/:documentId
 * Get the most recent plagiarism check for a document
 */
const getLatestCheck = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Verify document access
    const document = await Document.findById(documentId);
    if (!document) {
      return sendError(res, { statusCode: 404, message: "Document not found." });
    }

    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    const isPrivileged = ["lecturer", "admin"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return sendError(res, { statusCode: 403, message: "Access denied." });
    }

    const check = await PlagiarismCheck.findLatestForDocument(documentId)
      .populate("checkedBy", "full_name email")
      .populate("sources.sourceDocumentId", "title originalFilename uploadedBy");

    if (!check) {
      return sendSuccess(res, {
        message: "No checks found for this document.",
        data: { check: null },
      });
    }

    return sendSuccess(res, {
      message: "Latest check retrieved.",
      data: { check: formatCheckResponse(check) },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendError(res, { statusCode: 400, message: "Invalid document ID." });
    }
    console.error("❌ Get check error:", error.message);
    return sendError(res, { statusCode: 500, message: "Failed to retrieve check." });
  }
};

// ─── Get Single Check by ID ──────────────────────────────────────────────────

/**
 * GET /api/checks/:checkId
 */
const getCheckById = async (req, res) => {
  try {
    const { checkId } = req.params;

    const check = await PlagiarismCheck.findById(checkId)
      .populate("checkedBy", "full_name email")
      .populate("documentId", "title originalFilename uploadedBy")
      .populate("sources.sourceDocumentId", "title originalFilename uploadedBy");

    if (!check) {
      return sendError(res, { statusCode: 404, message: "Check not found." });
    }

    // Access control: owner of document OR lecturer/admin
    const isOwner =
      check.checkedBy._id.toString() === req.user._id.toString() ||
      check.documentId?.uploadedBy?.toString() === req.user._id.toString();
    const isPrivileged = ["lecturer", "admin"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return sendError(res, { statusCode: 403, message: "Access denied." });
    }

    return sendSuccess(res, {
      message: "Check retrieved.",
      data: { check: formatCheckResponse(check) },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendError(res, { statusCode: 400, message: "Invalid check ID." });
    }
    console.error("❌ Get check error:", error.message);
    return sendError(res, { statusCode: 500, message: "Failed to retrieve check." });
  }
};

// ─── Get User's Check History ────────────────────────────────────────────────

/**
 * GET /api/checks
 * Get all checks performed by the current user
 */
const getMyChecks = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { checkedBy: req.user._id };

    const [checks, total] = await Promise.all([
      PlagiarismCheck.find(query)
        .select("-sources.matchedSegments") // Exclude heavy field for list
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("documentId", "title originalFilename fileType"),

      PlagiarismCheck.countDocuments(query),
    ]);

    return sendSuccess(res, {
      message: "Check history retrieved.",
      data: { checks: checks.map(formatCheckResponse) },
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("❌ Get checks error:", error.message);
    return sendError(res, { statusCode: 500, message: "Failed to retrieve checks." });
  }
};

// ─── Delete Check ─────────────────────────────────────────────────────────────

/**
 * DELETE /api/checks/:checkId
 * Delete a plagiarism check (admin or owner)
 */
const deleteCheck = async (req, res) => {
  try {
    const { checkId } = req.params;

    const check = await PlagiarismCheck.findById(checkId);

    if (!check) {
      return sendError(res, { statusCode: 404, message: "Check not found." });
    }

    const isOwner = check.checkedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return sendError(res, { statusCode: 403, message: "Access denied." });
    }

    await check.deleteOne();

    return sendSuccess(res, { message: "Check deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return sendError(res, { statusCode: 400, message: "Invalid check ID." });
    }
    console.error("❌ Delete check error:", error.message);
    return sendError(res, { statusCode: 500, message: "Failed to delete check." });
  }
};

// ─── Helper: Format Check Response ──────────────────────────────────────────
const formatCheckResponse = (check) => {
  if (!check) return null;
  return {
    id: check._id,
    documentId: check.documentId,
    documentTitle: check.documentTitle,
    checkedBy: check.checkedBy,
    overallScore: check.overallScore,
    riskLevel: check.riskLevel,
    sources: check.sources,
    webSources: check.webSources || [],         // ← NEW
    webSearchEnabled: check.webSearchEnabled,    // ← NEW
    webQueriesUsed: check.webQueriesUsed,        // ← NEW
    webSearchTime: check.webSearchTime,          // ← NEW
    totalSourcesScanned: check.totalSourcesScanned,
    matchedSourcesCount: check.matchedSourcesCount,
    totalMatchedSegments: check.totalMatchedSegments,
    uniqueContentPercentage: check.uniqueContentPercentage,
    processingTime: check.processingTime,
    status: check.status,
    isHighRisk: check.overallScore >= 70,
    createdAt: check.createdAt,
    updatedAt: check.updatedAt,
  };
};

module.exports = {
  runCheck,
  getLatestCheck,
  getCheckById,
  getMyChecks,
  deleteCheck,
};