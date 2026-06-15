const User = require("../models/User");
const Document = require("../models/Document");
const PlagiarismCheck = require("../models/PlagiarismCheck");

// ─────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDocuments,
      highRiskCount,
      todayUploads,
      userBreakdown,
    ] = await Promise.all([
      User.countDocuments(),
      Document.countDocuments(),

      PlagiarismCheck.countDocuments({
        riskLevel: { $in: ["high", "critical"] },
        status: "completed",
      }),

      Document.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),

      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Shape userBreakdown into { student: N, lecturer: N, admin: N }
    const roleMap = { student: 0, lecturer: 0, admin: 0 };
    userBreakdown.forEach(({ _id, count }) => {
      if (_id in roleMap) roleMap[_id] = count;
    });

    res.json({
      totalUsers,
      totalDocuments,
      highRiskCount,
      todayUploads,
      userBreakdown: roleMap,
    });
  } catch (err) {
    console.error("Admin getStats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/users
// Query params: ?search=&role=&page=1&limit=20
// ─────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { search = "", role = "", page = 1, limit = 20 } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && ["student", "lecturer", "admin"].includes(role)) {
      filter.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    // For each user, attach their document count
    const userIds = users.map((u) => u._id);
    const docCounts = await Document.aggregate([
      { $match: { uploadedBy: { $in: userIds } } },
      { $group: { _id: "$uploadedBy", count: { $sum: 1 } } },
    ]);

    const docCountMap = {};
    docCounts.forEach(({ _id, count }) => {
      docCountMap[_id.toString()] = count;
    });

    const usersWithMeta = users.map((u) => ({
      ...u.toObject(),
      documentCount: docCountMap[u._id.toString()] || 0,
    }));

    res.json({
      users: usersWithMeta,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Admin getUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/admin/users/:id
// Body: { role: "lecturer" }
// ─────────────────────────────────────────────
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "lecturer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (err) {
    console.error("Admin updateUserRole error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/admin/users/:id/toggle
// Enables or disables a user account
// ─────────────────────────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    // Prevent admin from disabling themselves
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot disable your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.is_active = !user.is_active;
    await user.save();

    res.json({
      message: `User ${user.is_active ? "enabled" : "disabled"}`,
      user: { _id: user._id, is_active: user.is_active },
    });
  } catch (err) {
    console.error("Admin toggleUserStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/admin/users/:id
// ─────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Also remove their documents + checks (cleanup)
    const docs = await Document.find({ uploadedBy: req.params.id });
    const docIds = docs.map((d) => d._id);

    await Document.deleteMany({ uploadedBy: req.params.id });
    await PlagiarismCheck.deleteMany({ documentId: { $in: docIds } });

    res.json({ message: "User and their data deleted" });
  } catch (err) {
    console.error("Admin deleteUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/documents
// Query params: ?search=&riskLevel=&page=1&limit=20
// ─────────────────────────────────────────────
exports.getDocuments = async (req, res) => {
  try {
    const {
      search = "",
      riskLevel = "",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { originalFilename: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate("uploadedBy", "full_name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Document.countDocuments(filter),
    ]);

    // Attach latest check info to each document
    const docIds = documents.map((d) => d._id);
    const latestChecks = await PlagiarismCheck.aggregate([
      { $match: { documentId: { $in: docIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$documentId",
          overallScore: { $first: "$overallScore" },
          riskLevel: { $first: "$riskLevel" },
          status: { $first: "$status" },
        },
      },
    ]);

    const checkMap = {};
    latestChecks.forEach((c) => {
      checkMap[c._id.toString()] = c;
    });

    let enriched = documents.map((doc) => ({
      ...doc.toObject(),
      latestCheck: checkMap[doc._id.toString()] || null,
    }));

    // Filter by riskLevel AFTER enriching (since it lives in checks)
    if (riskLevel && ["low", "medium", "high", "critical"].includes(riskLevel)) {
      enriched = enriched.filter(
        (d) => d.latestCheck?.riskLevel === riskLevel
      );
    }

    res.json({
      documents: enriched,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Admin getDocuments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/admin/documents/:id
// ─────────────────────────────────────────────
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    await PlagiarismCheck.deleteMany({ documentId: req.params.id });

    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("Admin deleteDocument error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/activity  (recent activity feed)
// ─────────────────────────────────────────────
exports.getRecentActivity = async (req, res) => {
  try {
    const recentDocs = await Document.find()
      .populate("uploadedBy", "full_name email role")
      .sort({ createdAt: -1 })
      .limit(10);

    const activity = recentDocs.map((doc) => ({
      _id: doc._id,
      type: "upload",
      user: doc.uploadedBy,
      document: {
        title: doc.title,
        originalFilename: doc.originalFilename,
      },
      createdAt: doc.createdAt,
    }));

    res.json({ activity });
  } catch (err) {
    console.error("Admin getRecentActivity error:", err);
    res.status(500).json({ message: "Server error" });
  }
};