// backend/src/models/PlagiarismCheck.js
const mongoose = require("mongoose");

// ─── Matched Segment Sub-schema ─────────────────────────────────────────────
// Represents a single chunk of text that matches another document
const MatchedSegmentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    startIndex: {
      type: Number,
      default: 0,
    },
    endIndex: {
      type: Number,
      default: 0,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    matchType: {
      type: String,
      enum: ["exact", "near", "paraphrase"],
      default: "exact",
    },
  },
  { _id: false }
);


// backend/src/models/PlagiarismCheck.js
// Find the SourceMatchSchema and ADD this new schema BEFORE it:

// ─── Web Source Sub-schema ────────────────────────────────────────────────────
const WebSourceSchema = new mongoose.Schema(
  {
    sourceUrl: {
      type: String,
      required: true,
    },
    sourceTitle: {
      type: String,
      default: "Untitled",
    },
    sourceSnippet: {
      type: String,
      default: "",
    },
    overallSimilarity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    matchedPhrasesCount: {
      type: Number,
      default: 0,
    },
    matchedPhrases: [
      {
        phrase: String,
        snippet: String,
        overlap: Number,
      },
    ],
    sourceType: {
      type: String,
      default: "web",
    },
  },
  { _id: false }
);


// ─── Source Match Sub-schema ─────────────────────────────────────────────────
// Represents one source document that matched (with details)
const SourceMatchSchema = new mongoose.Schema(
  {
    sourceDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    sourceTitle: {
      type: String,
      required: true,
    },
    sourceUploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sourceUploaderName: {
      type: String,
      default: "Unknown",
    },

    // Similarity metrics for THIS source
    overallSimilarity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    jaccardSimilarity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    simhashSimilarity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Actual matched text segments
    matchedSegments: {
      type: [MatchedSegmentSchema],
      default: [],
    },

    // Stats
    matchedWordCount: {
      type: Number,
      default: 0,
    },
    matchPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { _id: false }
);



// ─── Main Plagiarism Check Schema ────────────────────────────────────────────
const PlagiarismCheckSchema = new mongoose.Schema(
  {
    // ── Target document being checked ──
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    documentTitle: {
      type: String,
      required: true,
    },

    // ── User who initiated the check ──
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── Overall Results ──
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      // Weighted average plagiarism percentage across all sources
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    // ── Source matches (top N most similar documents) ──
    sources: {
      type: [SourceMatchSchema],
      default: [],
    },

    // Add to PlagiarismCheckSchema (alongside `sources` field):

    // ── Web sources ──
    webSources: {
      type: [WebSourceSchema],
      default: [],
    },

    webSearchEnabled: {
      type: Boolean,
      default: false,
    },

    webQueriesUsed: {
      type: Number,
      default: 0,
    },

    webSearchTime: {
      type: Number,
      default: 0,
    },
    

    // ── Aggregate stats ──
    totalSourcesScanned: {
      type: Number,
      default: 0,
    },
    matchedSourcesCount: {
      type: Number,
      default: 0,
    },
    totalMatchedSegments: {
      type: Number,
      default: 0,
    },
    uniqueContentPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },

    // ── Processing info ──
    processingTime: {
      type: Number, // milliseconds
      default: 0,
    },

    // ── Algorithm settings used (for reproducibility) ──
    settings: {
      minSimilarityThreshold: { type: Number, default: 30 },
      minMatchedWords: { type: Number, default: 8 },
      maxSourcesReturned: { type: Number, default: 10 },
    },

    // ── Status ──
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "completed",
    },

    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
PlagiarismCheckSchema.index({ documentId: 1, createdAt: -1 });
PlagiarismCheckSchema.index({ checkedBy: 1, createdAt: -1 });
PlagiarismCheckSchema.index({ overallScore: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
PlagiarismCheckSchema.virtual("isHighRisk").get(function () {
  return this.overallScore >= 70;
});

// ─── Static Methods ───────────────────────────────────────────────────────────
PlagiarismCheckSchema.statics.findLatestForDocument = function (documentId) {
  return this.findOne({ documentId }).sort({ createdAt: -1 });
};

PlagiarismCheckSchema.statics.findByUser = function (userId) {
  return this.find({ checkedBy: userId }).sort({ createdAt: -1 });
};

const PlagiarismCheck = mongoose.model("PlagiarismCheck", PlagiarismCheckSchema);

module.exports = PlagiarismCheck;