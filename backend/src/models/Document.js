// src/models/Document.js
const mongoose = require("mongoose");

// ─── Fingerprint Schema (embedded) ───────────────────────────────────────────
const FingerprintSchema = new mongoose.Schema(
  {
    shingles: {
      type: [String],
      default: [],
    },
    shingleHashes: {
      type: [String],
      default: [],
    },
    minHashes: {
      type: [Number],
      default: [],
    },
    simhash: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

// ─── Text Statistics Schema (embedded) ───────────────────────────────────────
const TextStatsSchema = new mongoose.Schema(
  {
    wordCount: { type: Number, default: 0 },
    characterCount: { type: Number, default: 0 },
    sentenceCount: { type: Number, default: 0 },
    paragraphCount: { type: Number, default: 0 },
    avgWordsPerSentence: { type: Number, default: 0 },
    cleanWordCount: { type: Number, default: 0 },
  },
  { _id: false }
);

// ─── Main Document Schema ─────────────────────────────────────────────────────
const DocumentSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      maxlength: [255, "Title cannot exceed 255 characters"],
    },

    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      required: true,
      enum: {
        values: ["pdf", "docx", "doc", "txt"],
        message: "File type must be pdf, docx, doc, or txt",
      },
    },

    fileSize: {
      type: Number, // In bytes
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    // ── Ownership ─────────────────────────────────────────────────────────────
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    uploaderRole: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      required: true,
    },

    // ── Assignment Context (optional) ─────────────────────────────────────────
    assignmentTitle: {
      type: String,
      trim: true,
      default: null,
    },

    courseCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    submissionNote: {
      type: String,
      trim: true,
      maxlength: [500, "Submission note cannot exceed 500 characters"],
      default: null,
    },

    // ── File Storage ──────────────────────────────────────────────────────────
    cloudinaryPublicId: {
      type: String,
      default: null,
    },

    cloudinaryUrl: {
      type: String,
      default: null,
    },

    cloudinaryResourceType: {
      type: String,
      default: "raw",
    },

    // ── Extracted Content ─────────────────────────────────────────────────────
    extractedText: {
      type: String,
      default: null,
      // Raw extracted text (displayed to user)
    },

    cleanedText: {
      type: String,
      default: null,
      // Preprocessed text (used for comparison)
    },

    textStats: {
      type: TextStatsSchema,
      default: () => ({}),
    },

    // ── Fingerprint (for similarity detection) ────────────────────────────────
    fingerprint: {
      type: FingerprintSchema,
      default: () => ({}),
    },

    // ── Processing State ──────────────────────────────────────────────────────
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },

    processingError: {
      type: String,
      default: null,
    },

    processingTime: {
      type: Number, // milliseconds
      default: null,
    },

    // ── Check Results ─────────────────────────────────────────────────────────
    lastChecked: {
      type: Date,
      default: null,
    },

    plagiarismScore: {
      type: Number,  // 0–100 percentage
      min: 0,
      max: 100,
      default: null,
    },

    checkStatus: {
      type: String,
      enum: ["unchecked", "checking", "checked", "error"],
      default: "unchecked",
    },

    // ── Soft Delete ───────────────────────────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
DocumentSchema.index({ uploadedBy: 1, createdAt: -1 });
DocumentSchema.index({ processingStatus: 1 });
DocumentSchema.index({ checkStatus: 1 });
DocumentSchema.index({ isDeleted: 1 });
DocumentSchema.index({ courseCode: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
DocumentSchema.virtual("fileSizeFormatted").get(function () {
  const bytes = this.fileSize;
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
});

DocumentSchema.virtual("isProcessed").get(function () {
  return this.processingStatus === "completed";
});

DocumentSchema.virtual("hasBeenChecked").get(function () {
  return this.checkStatus === "checked";
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Soft delete a document
 */
DocumentSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

/**
 * Mark document as processing failed
 */
DocumentSchema.methods.markFailed = async function (errorMessage) {
  this.processingStatus = "failed";
  this.processingError = errorMessage;
  await this.save();
};

// ─── Static Methods ───────────────────────────────────────────────────────────

/**
 * Find all active (non-deleted) documents for a user
 */
DocumentSchema.statics.findByUser = function (userId) {
  return this.find({ uploadedBy: userId, isDeleted: false }).sort({ createdAt: -1 });
};

/**
 * Find all active documents (for comparison pool)
 */
DocumentSchema.statics.findAllActive = function () {
  return this.find({
    isDeleted: false,
    processingStatus: "completed",
  });
};

// ─── Query Middleware ─────────────────────────────────────────────────────────
// Automatically exclude soft-deleted documents from all find queries
// Uses array of hook names instead of regex (regex causes issues with countDocuments)

const findHooks = [
  "find",
  "findOne",
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndRemove",
  "count",
  "countDocuments",
  "estimatedDocumentCount",
];

findHooks.forEach((hook) => {
  DocumentSchema.pre(hook, function (next) {
    const query = this.getQuery();
    if (query.isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
    if (typeof next === "function") {
      next();
    }
  });
});

const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;