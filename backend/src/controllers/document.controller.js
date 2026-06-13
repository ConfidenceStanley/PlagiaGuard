// src/controllers/document.controller.js
"use strict";

const Document = require("../models/Document");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/cloudinary.service");
const { extractText } = require("../services/extraction.service");
const { generateFingerprint } = require("../services/fingerprint.service");
const {
  preprocessForDisplay,
  preprocessForComparison,
  getTextStats,
} = require("../utils/textProcessor");
const { sendSuccess, sendError } = require("../utils/apiResponse");

console.log("✅ document.controller.js loaded");

// ─── Upload Document ──────────────────────────────────────────────────────────
const uploadDocument = async (req, res) => {
  const startTime = Date.now();

  if (!req.file) {
    return sendError(res, {
      statusCode: 400,
      message: "No file uploaded. Please select a PDF, DOCX, DOC, or TXT file.",
    });
  }

  const { originalname, buffer, mimetype, size } = req.file;
  const { title, assignmentTitle, courseCode, submissionNote } = req.body;

  if (!title || title.trim().length === 0) {
    return sendError(res, {
      statusCode: 400,
      message: "Document title is required.",
    });
  }

  if (title.trim().length > 255) {
    return sendError(res, {
      statusCode: 400,
      message: "Title cannot exceed 255 characters.",
    });
  }

  let cloudinaryResult = null;
  let document = null;

  try {
    // 3. Create pending document record
    document = await Document.create({
      title: title.trim(),
      originalFilename: originalname,
      fileType: "pdf",
      fileSize: size,
      mimeType: mimetype,
      uploadedBy: req.user._id,
      uploaderRole: req.user.role,
      assignmentTitle: assignmentTitle?.trim() || null,
      courseCode: courseCode?.trim().toUpperCase() || null,
      submissionNote: submissionNote?.trim() || null,
      processingStatus: "processing",
    });

    // 4. Upload to Cloudinary
    console.log(`☁️  Uploading "${originalname}" to Cloudinary...`);
    cloudinaryResult = await uploadToCloudinary(
      buffer,
      originalname,
      mimetype,
      req.user._id.toString()
    );

    document.cloudinaryPublicId = cloudinaryResult.publicId;
    document.cloudinaryUrl = cloudinaryResult.secureUrl;
    document.cloudinaryResourceType = cloudinaryResult.resourceType;

    // 5. Extract text
    console.log(`📄 Extracting text from "${originalname}"...`);
    const { text: rawText, fileType } = await extractText(
      buffer,
      originalname,
      mimetype
    );
    document.fileType = fileType;

    // 6. Preprocess text
    console.log(`🔧 Preprocessing text...`);
    const displayText = preprocessForDisplay(rawText);
    const comparisonText = preprocessForComparison(rawText);
    document.extractedText = displayText;
    document.cleanedText = comparisonText;
    document.textStats = getTextStats(rawText, comparisonText);

    // 7. Generate fingerprint
    console.log(`🔑 Generating fingerprint...`);
    const fingerprint = generateFingerprint(comparisonText);
    document.fingerprint = fingerprint;

    // 8. Mark as completed
    const processingTime = Date.now() - startTime;
    document.processingStatus = "completed";
    document.processingTime = processingTime;
    await document.save();

    console.log(
      `✅ Document "${title}" processed in ${processingTime}ms | ` +
        `Words: ${document.textStats.wordCount} | ` +
        `Shingles: ${fingerprint.shingles?.length || 0}`
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "Document uploaded and processed successfully.",
      data: { document: formatDocumentResponse(document) },
    });

  } catch (error) {
    console.error("❌ Document upload error:", error.message);
    console.error("❌ Stack:", error.stack);

    // ── Cleanup Cloudinary if upload succeeded but later step failed ──
    if (cloudinaryResult?.publicId) {
      try {
        await deleteFromCloudinary(cloudinaryResult.publicId);
        console.log("🗑️  Cleaned up Cloudinary file after error");
      } catch (cleanupErr) {
        console.error("⚠️  Cloudinary cleanup failed:", cleanupErr.message);
      }
    }

    // ── Cleanup DB record ──
    if (document?._id) {
      try {
        await Document.findByIdAndDelete(document._id);
      } catch {
        await document.markFailed?.(error.message).catch(() => {});
      }
    }

    // ── User-friendly error responses ──
    // Empty/unreadable document
    if (
      error.message.includes("No extractable text") ||
      error.message.includes("too short") ||
      error.message.includes("empty") ||
      error.message.includes("scanned")
    ) {
      return sendError(res, { statusCode: 422, message: error.message });
    }

    // ── Everything else → 500 with the real message ──
    return sendError(res, {
      statusCode: 500,
      message: error.message || "Document processing failed. Please try again.",
    });
  }
};

// ─── Get My Documents ─────────────────────────────────────────────────────────
const getMyDocuments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      status,
      courseCode,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { uploadedBy: req.user._id };

    if (status) query.checkStatus = status;
    if (courseCode) query.courseCode = courseCode.toUpperCase();

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { assignmentTitle: { $regex: search, $options: "i" } },
        { courseCode: { $regex: search, $options: "i" } },
      ];
    }

    const allowedSorts = [
      "createdAt", "-createdAt",
      "title", "-title",
      "plagiarismScore", "-plagiarismScore",
      "fileSize", "-fileSize",
    ];
    const sortField = allowedSorts.includes(sort) ? sort : "-createdAt";

    const [documents, total] = await Promise.all([
      Document.find(query)
        .select("-extractedText -cleanedText -fingerprint")
        .sort(sortField)
        .skip(skip)
        .limit(limitNum)
        .populate("uploadedBy", "firstName lastName email"),
      Document.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, {
      message: "Documents retrieved successfully.",
      data: { documents: documents.map(formatDocumentResponse) },
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("❌ Get documents error:", error.message);
    return sendError(res, {
      statusCode: 500,
      message: "Failed to retrieve documents.",
    });
  }
};

// ─── Get Single Document ──────────────────────────────────────────────────────
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id).populate(
      "uploadedBy",
      "firstName lastName email role"
    );

    if (!document) {
      return sendError(res, { statusCode: 404, message: "Document not found." });
    }

    if (
      req.user.role === "student" &&
      document.uploadedBy._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, { statusCode: 403, message: "Access denied." });
    }

    return sendSuccess(res, {
      message: "Document retrieved successfully.",
      data: {
        document: formatDocumentResponse(document, { includeText: true }),
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendError(res, { statusCode: 400, message: "Invalid document ID." });
    }
    console.error("❌ Get document error:", error.message);
    return sendError(res, {
      statusCode: 500,
      message: "Failed to retrieve document.",
    });
  }
};

// ─── Get Document Text ────────────────────────────────────────────────────────
const getDocumentText = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, charsPerPage = 5000 } = req.query;

    const document = await Document.findById(id).select(
      "extractedText uploadedBy processingStatus"
    );

    if (!document) {
      return sendError(res, { statusCode: 404, message: "Document not found." });
    }

    if (
      req.user.role === "student" &&
      document.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, { statusCode: 403, message: "Access denied." });
    }

    if (document.processingStatus !== "completed") {
      return sendError(res, {
        statusCode: 422,
        message: `Document is ${document.processingStatus}. Text not yet available.`,
      });
    }

    const text = document.extractedText || "";
    const pageNum = Math.max(1, parseInt(page));
    const chars = Math.min(10000, Math.max(1000, parseInt(charsPerPage)));
    const start = (pageNum - 1) * chars;
    const end = start + chars;
    const totalPages = Math.ceil(text.length / chars);

    return sendSuccess(res, {
      message: "Document text retrieved.",
      data: { text: text.slice(start, end), totalCharacters: text.length },
      meta: {
        page: pageNum,
        charsPerPage: chars,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendError(res, { statusCode: 400, message: "Invalid document ID." });
    }
    console.error("❌ Get text error:", error.message);
    return sendError(res, {
      statusCode: 500,
      message: "Failed to retrieve document text.",
    });
  }
};

// ─── Delete Document ──────────────────────────────────────────────────────────
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return sendError(res, { statusCode: 404, message: "Document not found." });
    }

    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return sendError(res, { statusCode: 403, message: "Access denied." });
    }

    await document.softDelete();

    if (document.cloudinaryPublicId) {
      deleteFromCloudinary(document.cloudinaryPublicId).catch((err) => {
        console.error("⚠️  Background Cloudinary delete failed:", err.message);
      });
    }

    return sendSuccess(res, { message: "Document deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return sendError(res, { statusCode: 400, message: "Invalid document ID." });
    }
    console.error("❌ Delete document error:", error.message);
    return sendError(res, {
      statusCode: 500,
      message: "Failed to delete document.",
    });
  }
};

// ─── Update Document ──────────────────────────────────────────────────────────
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, assignmentTitle, courseCode, submissionNote } = req.body;

    const document = await Document.findById(id);

    if (!document) {
      return sendError(res, { statusCode: 404, message: "Document not found." });
    }

    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return sendError(res, { statusCode: 403, message: "Access denied." });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return sendError(res, {
          statusCode: 400,
          message: "Title cannot be empty.",
        });
      }
      document.title = title.trim();
    }

    if (assignmentTitle !== undefined)
      document.assignmentTitle = assignmentTitle?.trim() || null;
    if (courseCode !== undefined)
      document.courseCode = courseCode?.trim().toUpperCase() || null;
    if (submissionNote !== undefined)
      document.submissionNote = submissionNote?.trim() || null;

    await document.save();

    return sendSuccess(res, {
      message: "Document updated successfully.",
      data: { document: formatDocumentResponse(document) },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return sendError(res, { statusCode: 400, message: "Invalid document ID." });
    }
    console.error("❌ Update document error:", error.message);
    return sendError(res, {
      statusCode: 500,
      message: "Failed to update document.",
    });
  }
};

// ─── Get All Documents (Admin/Lecturer) ───────────────────────────────────────
const getAllDocuments = async (req, res) => {
  try {
    if (!["admin", "lecturer"].includes(req.user.role)) {
      return sendError(res, { statusCode: 403, message: "Access denied." });
    }

    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      courseCode,
      uploaderRole,
      status,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (courseCode) query.courseCode = courseCode.toUpperCase();
    if (uploaderRole) query.uploaderRole = uploaderRole;
    if (status) query.checkStatus = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { originalFilename: { $regex: search, $options: "i" } },
        { assignmentTitle: { $regex: search, $options: "i" } },
        { courseCode: { $regex: search, $options: "i" } },
      ];
    }

    const allowedSorts = [
      "createdAt", "-createdAt",
      "title", "-title",
      "plagiarismScore", "-plagiarismScore",
    ];
    const sortField = allowedSorts.includes(sort) ? sort : "-createdAt";

    const [documents, total] = await Promise.all([
      Document.find(query)
        .select("-extractedText -cleanedText -fingerprint")
        .sort(sortField)
        .skip(skip)
        .limit(limitNum)
        .populate("uploadedBy", "firstName lastName email role matricNumber"),
      Document.countDocuments(query),
    ]);

    return sendSuccess(res, {
      message: "All documents retrieved successfully.",
      data: { documents: documents.map(formatDocumentResponse) },
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("❌ Get all documents error:", error.message);
    return sendError(res, {
      statusCode: 500,
      message: "Failed to retrieve documents.",
    });
  }
};

// ─── Document Stats ───────────────────────────────────────────────────────────
const getDocumentStats = async (req, res) => {
  try {
    const matchQuery =
      req.user.role === "admin"
        ? { isDeleted: false }
        : { uploadedBy: req.user._id, isDeleted: false };

    const stats = await Document.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
          avgPlagiarismScore: { $avg: "$plagiarismScore" },
          checkedCount: {
            $sum: { $cond: [{ $eq: ["$checkStatus", "checked"] }, 1, 0] },
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$checkStatus", "unchecked"] }, 1, 0] },
          },
          pdfCount: {
            $sum: { $cond: [{ $eq: ["$fileType", "pdf"] }, 1, 0] },
          },
          docxCount: {
            $sum: { $cond: [{ $eq: ["$fileType", "docx"] }, 1, 0] },
          },
          txtCount: {
            $sum: { $cond: [{ $eq: ["$fileType", "txt"] }, 1, 0] },
          },
          highRiskCount: {
            $sum: { $cond: [{ $gte: ["$plagiarismScore", 70] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalDocuments: 1,
          totalSizeBytes: "$totalSize",
          avgPlagiarismScore: { $round: ["$avgPlagiarismScore", 1] },
          checkedCount: 1,
          pendingCount: 1,
          pdfCount: 1,
          docxCount: 1,
          txtCount: 1,
          highRiskCount: 1,
        },
      },
    ]);

    const result = stats[0] || {
      totalDocuments: 0,
      totalSizeBytes: 0,
      avgPlagiarismScore: null,
      checkedCount: 0,
      pendingCount: 0,
      pdfCount: 0,
      docxCount: 0,
      txtCount: 0,
      highRiskCount: 0,
    };

    const bytes = result.totalSizeBytes || 0;
    result.totalSizeFormatted =
      bytes < 1024 * 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

    return sendSuccess(res, {
      message: "Document statistics retrieved.",
      data: { stats: result },
    });
  } catch (error) {
    console.error("❌ Stats error:", error.message);
    return sendError(res, {
      statusCode: 500,
      message: "Failed to retrieve statistics.",
    });
  }
};

// ─── Format Response ──────────────────────────────────────────────────────────
const formatDocumentResponse = (doc, options = {}) => {
  const { includeText = false } = options;

  const formatted = {
    id: doc._id,
    title: doc.title,
    originalFilename: doc.originalFilename,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    fileSizeFormatted: doc.fileSizeFormatted,
    mimeType: doc.mimeType,
    uploadedBy: doc.uploadedBy,
    uploaderRole: doc.uploaderRole,
    assignmentTitle: doc.assignmentTitle,
    courseCode: doc.courseCode,
    submissionNote: doc.submissionNote,
    cloudinaryUrl: doc.cloudinaryUrl,
    textStats: doc.textStats,
    processingStatus: doc.processingStatus,
    processingTime: doc.processingTime,
    processingError: doc.processingError,
    checkStatus: doc.checkStatus,
    plagiarismScore: doc.plagiarismScore,
    lastChecked: doc.lastChecked,
    isProcessed: doc.isProcessed,
    hasBeenChecked: doc.hasBeenChecked,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  if (includeText) {
    formatted.extractedText = doc.extractedText;
  }

  return formatted;
};

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  getDocumentText,
  deleteDocument,
  updateDocument,
  getAllDocuments,
  getDocumentStats,
};