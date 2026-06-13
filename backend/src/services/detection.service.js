// backend/src/services/detection.service.js

const Document = require("../models/Document");
const { compareDocuments } = require("./comparison.service");
const { detectWebPlagiarism } = require("./webSearch.service");

// ─── Risk Level Calculation ───────────────────────────────────────────────────
const calculateRiskLevel = (score) => {
  if (score >= 70) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
};

// ─── Main Detection Function ──────────────────────────────────────────────────
const detectPlagiarism = async (targetDocumentId, options = {}) => {
  const startTime = Date.now();

  const {
    minSimilarityThreshold = 10,
    maxSourcesReturned     = 10,
    minMatchedWords        = 5,
    excludeSelf            = true,
    includeWebSearch       = true,
  } = options;

  // ── 1. Load target document ──
  const targetDoc = await Document.findById(targetDocumentId);
  if (!targetDoc) {
    throw new Error(`Target document not found: ${targetDocumentId}`);
  }
  if (!targetDoc.fingerprint || targetDoc.fingerprint.length === 0) {
    throw new Error(`Target document has no fingerprint. Re-process the document first.`);
  }

  console.log(`\n🔍 Starting plagiarism check for: "${targetDoc.title}"`);
  console.log(`   Fingerprint chunks: ${targetDoc.fingerprint.length}`);

  // ── 2. Load all other completed documents ──
  const query = {
    processingStatus: "completed",
    _id: { $ne: targetDocumentId },
  };

  if (excludeSelf) {
    query.uploadedBy = { $ne: targetDoc.uploadedBy };
  }

  const sourceDocs = await Document.find(query).select(
    "title originalFilename uploadedBy fingerprint textStats"
  );

  console.log(`   Source documents found: ${sourceDocs.length}`);

  // ── 3. Compare against all source documents (LOCAL) ──
  const matches = [];

  for (const sourceDoc of sourceDocs) {
    try {
      if (!sourceDoc.fingerprint || sourceDoc.fingerprint.length === 0) {
        console.warn(`   ⚠️  Skipping "${sourceDoc.title}" — no fingerprint`);
        continue;
      }

      const match = compareDocuments(targetDoc, sourceDoc, {
        minSimilarity: minSimilarityThreshold,
      });

      if (match) {
        matches.push(match);
        console.log(
          `   ✓ Match: "${sourceDoc.title}" → ${match.overallSimilarity.toFixed(1)}%`
        );
      }
    } catch (err) {
      console.error(`   ⚠️  Error comparing "${sourceDoc.title}": ${err.message}`);
    }
  }

  matches.sort((a, b) => b.overallSimilarity - a.overallSimilarity);
  const topMatches = matches.slice(0, maxSourcesReturned);

  // ── 4. Web Search ──
  let webResults = {
    enabled: false,
    sources: [],
    queriesUsed: 0,
    processingTime: 0,
  };

  if (includeWebSearch) {
    try {
      console.log(`\n🌐 Running web plagiarism search...`);
      webResults = await detectWebPlagiarism(targetDoc);
      console.log(`   Web sources found: ${webResults.sources.length}`);
      console.log(`   Queries used: ${webResults.queriesUsed}`);
    } catch (err) {
      console.error(`   ⚠️  Web search failed: ${err.message}`);
    }
  }

  // ── 5. Calculate unified plagiarism score ──
  let overallScore = 0;
  let totalMatchedSegments = 0;

  // Local score
  let localScore = 0;
  if (topMatches.length > 0) {
    const highestLocal = topMatches[0].overallSimilarity;
    const avgLocal =
      topMatches.reduce((s, m) => s + m.overallSimilarity, 0) / topMatches.length;
    localScore = highestLocal * 0.7 + avgLocal * 0.3;
  }

  // Web score
  let webScore = 0;
  if (webResults.sources.length > 0) {
    const topWeb = webResults.sources[0];
    const totalPhrases = Math.max(webResults.queriesUsed || 1, 1);
    const matchedRatio = (topWeb.matchedPhrasesCount / totalPhrases) * 100;
    webScore = Math.min(100, matchedRatio * 1.5);
  }

  // Take the highest (most concerning)
  overallScore = Math.round(Math.max(localScore, webScore) * 10) / 10;
  overallScore = Math.min(overallScore, 100);

  totalMatchedSegments = topMatches.reduce(
    (sum, m) => sum + (m.matchedSegments?.length || 0),
    0
  );

  // ── 6. Compute aggregate stats ──
  // uniqueContentPercentage derived from overallScore so it's always consistent
  const uniqueContentPercentage = Math.max(
    0,
    Math.round((100 - overallScore) * 10) / 10
  );

  const processingTime = Date.now() - startTime;

  console.log(`\n✅ Detection complete in ${processingTime}ms`);
  console.log(`   Overall score:         ${overallScore}%`);
  console.log(`   Unique content:        ${uniqueContentPercentage}%`);
  console.log(`   Risk level:            ${calculateRiskLevel(overallScore)}`);
  console.log(`   Local matches:         ${topMatches.length}`);
  console.log(`   Web matches:           ${webResults.sources.length}\n`);

  return {
    targetDocument: {
      id: targetDoc._id,
      title: targetDoc.title,
    },
    overallScore,
    riskLevel: calculateRiskLevel(overallScore),
    sources: topMatches,
    webSources: webResults.sources,
    webSearchEnabled: webResults.enabled,
    webQueriesUsed: webResults.queriesUsed,
    webSearchTime: webResults.processingTime,
    totalSourcesScanned: sourceDocs.length,
    matchedSourcesCount: topMatches.length,
    totalMatchedSegments,
    uniqueContentPercentage,
    processingTime,
  };
};

module.exports = {
  detectPlagiarism,
  calculateRiskLevel,
};