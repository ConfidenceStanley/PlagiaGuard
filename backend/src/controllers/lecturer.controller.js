// backend/src/controllers/lecturer.controller.js

const Document = require("../models/Document");
const PlagiarismCheck = require("../models/PlagiarismCheck");

// ─────────────────────────────────────────────
// GET /api/lecturer/stats
// ─────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const totalDocs = await Document.countDocuments();

    const allChecks = await PlagiarismCheck.find({ status: "completed" }).lean();

    // Use overallScore (your actual field name)
    const highRiskCount = allChecks.filter((c) => (c.overallScore ?? 0) >= 50).length;

    const avgScore =
      allChecks.length > 0
        ? Math.round(
            allChecks.reduce((sum, c) => sum + (c.overallScore ?? 0), 0) /
              allChecks.length
          )
        : 0;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const docsToday = await Document.countDocuments({
      createdAt: { $gte: startOfDay },
    });

    res.json({
      totalDocs,
      highRiskCount,
      avgScore,
      docsToday,
    });
  } catch (err) {
    console.error("Lecturer stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// ─────────────────────────────────────────────
// GET /api/lecturer/submissions
// ─────────────────────────────────────────────
const getSubmissions = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate("uploadedBy", "full_name email role")
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      documents.map(async (doc) => {
        const latestCheck = await PlagiarismCheck.findOne({
          documentId: doc._id,
          status: "completed",
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...doc,
          latestCheck: latestCheck || null,
        };
      })
    );

    res.json({ submissions: enriched });
  } catch (err) {
    console.error("Lecturer submissions error:", err);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

// ─────────────────────────────────────────────
// GET /api/lecturer/high-risk
// ─────────────────────────────────────────────
const getHighRisk = async (req, res) => {
  try {
    const highRiskChecks = await PlagiarismCheck.find({
      status: "completed",
      overallScore: { $gte: 50 },
    })
      .sort({ overallScore: -1 })
      .lean();

    // Manually populate the document and uploader
    const populated = await Promise.all(
      highRiskChecks.map(async (check) => {
        const document = await Document.findById(check.documentId)
          .populate("uploadedBy", "full_name email")
          .lean();

        if (!document) return null;

        return {
          ...check,
          document,
        };
      })
    );

    const valid = populated.filter(Boolean);

    res.json({ highRisk: valid });
  } catch (err) {
    console.error("Lecturer high-risk error:", err);
    res.status(500).json({ message: "Failed to fetch high risk submissions" });
  }
};

// ─────────────────────────────────────────────
// GET /api/lecturer/checks/:docId
// ─────────────────────────────────────────────
const getDocumentCheck = async (req, res) => {
  try {
    const { docId } = req.params;

    const check = await PlagiarismCheck.findOne({
      documentId: docId,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!check) {
      return res.status(404).json({ message: "No report found for this document" });
    }

    const document = await Document.findById(docId)
      .populate("uploadedBy", "full_name email")
      .lean();

    res.json({ check: { ...check, document } });
  } catch (err) {
    console.error("Lecturer getDocumentCheck error:", err);
    res.status(500).json({ message: "Failed to fetch report" });
  }
};

module.exports = {
  getStats,
  getSubmissions,
  getHighRisk,
  getDocumentCheck,
};