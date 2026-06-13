// backend/src/services/comparison.service.js
// FIXED comparison algorithm with detailed logging

const {
  estimateJaccardSimilarity,
  computeSimHashSimilarity,
  exactJaccardSimilarity,
} = require("./fingerprint.service");

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_MATCH_WORDS = 5;
const MERGE_DISTANCE = 50;

// ─── Find common shingles ───────────────────────────────────────────────────
const findCommonShingles = (shingles1, shingles2) => {
  if (!shingles1?.length || !shingles2?.length) return [];

  const set2 = new Set(shingles2);
  const common = [];
  const seen = new Set();

  for (const s of shingles1) {
    if (set2.has(s) && !seen.has(s)) {
      common.push(s);
      seen.add(s);
    }
  }

  return common;
};

// ─── Extract matched segments from original text ────────────────────────────
const extractMatchedSegments = (originalText, cleanedText, commonShingles) => {
  if (!commonShingles?.length || !cleanedText) return [];

  const segments = [];
  const cleanedLower = cleanedText.toLowerCase();
  const originalLower = (originalText || "").toLowerCase();

  const matchPositions = [];

  for (const shingle of commonShingles) {
    const shingleLower = shingle.toLowerCase();
    let pos = cleanedLower.indexOf(shingleLower);

    while (pos !== -1) {
      matchPositions.push({
        start: pos,
        end: pos + shingleLower.length,
      });
      pos = cleanedLower.indexOf(shingleLower, pos + 1);

      if (matchPositions.length > 10000) break;
    }
  }

  if (matchPositions.length === 0) return [];

  matchPositions.sort((a, b) => a.start - b.start);

  const merged = [matchPositions[0]];
  for (let i = 1; i < matchPositions.length; i++) {
    const current = matchPositions[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end + MERGE_DISTANCE) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }

  for (const m of merged) {
    const segmentInCleaned = cleanedText.slice(m.start, m.end);
    const wordCount = segmentInCleaned.split(/\s+/).filter(Boolean).length;

    if (wordCount < MIN_MATCH_WORDS) continue;

    const firstWords = segmentInCleaned
      .split(/\s+/)
      .slice(0, 4)
      .join(" ")
      .toLowerCase();

    let segmentText = segmentInCleaned;
    let startIdx = m.start;
    let endIdx = m.end;

    if (originalLower && firstWords.length > 0) {
      const originalStart = originalLower.indexOf(firstWords);
      if (originalStart !== -1) {
        const approxLength = (m.end - m.start) * 1.4;
        endIdx = Math.min(originalStart + approxLength, originalText.length);

        const candidateText = originalText.slice(originalStart, endIdx);
        const sentenceEnd = candidateText.search(/[.!?]\s/);
        if (sentenceEnd > 30 && sentenceEnd < candidateText.length - 1) {
          endIdx = originalStart + sentenceEnd + 1;
        }

        startIdx = originalStart;
        segmentText = originalText.slice(startIdx, endIdx).trim();
      }
    }

    segments.push({
      text: segmentText,
      startIndex: startIdx,
      endIndex: endIdx,
      wordCount,
      matchType: "exact",
    });
  }

  return segments;
};

// ─── Main comparison ────────────────────────────────────────────────────────
const compareDocuments = (targetDoc, sourceDoc, options = {}) => {
  const { minSimilarity = 10 } = options;

  const targetShingles = targetDoc.fingerprint?.shingles || [];
  const sourceShingles = sourceDoc.fingerprint?.shingles || [];

  console.log(`     vs "${sourceDoc.title}":`);
  console.log(`        Target shingles: ${targetShingles.length}`);
  console.log(`        Source shingles: ${sourceShingles.length}`);

  if (targetShingles.length === 0 || sourceShingles.length === 0) {
    console.log(`        ❌ One has no shingles — skip\n`);
    return null;
  }

  // ── METHOD 1: Exact Jaccard ──
  const exactJaccard = exactJaccardSimilarity(targetShingles, sourceShingles) * 100;

  // ── METHOD 2: MinHash Jaccard estimate ──
  const minhashJaccard =
    estimateJaccardSimilarity(
      targetDoc.fingerprint?.minHashes,
      sourceDoc.fingerprint?.minHashes
    ) * 100;

  // ── METHOD 3: SimHash similarity ──
  const simhashSim =
    computeSimHashSimilarity(
      targetDoc.fingerprint?.simhash,
      sourceDoc.fingerprint?.simhash
    ) * 100;

  // ── Find common shingles ──
  const commonShingles = findCommonShingles(targetShingles, sourceShingles);

  // ── Extract matched segments ──
  const matchedSegments = extractMatchedSegments(
    targetDoc.extractedText || "",
    targetDoc.cleanedText || "",
    commonShingles
  );

  const matchedWordCount = matchedSegments.reduce(
    (sum, seg) => sum + seg.wordCount,
    0
  );

  const targetWordCount = targetDoc.textStats?.wordCount || 1;
  const matchPercentage =
    Math.round((matchedWordCount / targetWordCount) * 1000) / 10;

  // ── Overall similarity ──
  const overallSimilarity =
    Math.round(
      Math.max(
        exactJaccard,
        matchPercentage * 1.2,
        minhashJaccard * 0.9
      ) * 10
    ) / 10;

  console.log(`        Exact Jaccard  : ${exactJaccard.toFixed(1)}%`);
  console.log(`        MinHash Jaccard: ${minhashJaccard.toFixed(1)}%`);
  console.log(`        SimHash        : ${simhashSim.toFixed(1)}%`);
  console.log(`        Common shingles: ${commonShingles.length}`);
  console.log(`        Match %        : ${matchPercentage.toFixed(1)}%`);
  console.log(`        OVERALL        : ${overallSimilarity.toFixed(1)}%`);
  console.log(`        Threshold      : ${minSimilarity}%`);

  if (overallSimilarity < minSimilarity) {
    console.log(`        ❌ Below threshold — filtered out\n`);
    return null;
  }

  console.log(`        ✅ MATCH FOUND!\n`);

  return {
    sourceDocumentId: sourceDoc._id,
    sourceTitle: sourceDoc.title,
    sourceUploader: sourceDoc.uploadedBy?._id || sourceDoc.uploadedBy,
    sourceUploaderName: sourceDoc.uploadedBy?.full_name || "Unknown",
    overallSimilarity: Math.min(overallSimilarity, 100),
    jaccardSimilarity: Math.round(exactJaccard * 10) / 10,
    simhashSimilarity: Math.round(simhashSim * 10) / 10,
    matchedSegments,
    matchedWordCount,
    matchPercentage: Math.min(matchPercentage, 100),
  };
};

module.exports = {
  calculateJaccardSimilarity: (f1, f2) =>
    estimateJaccardSimilarity(f1?.minHashes, f2?.minHashes) * 100,
  findCommonShingles,
  extractMatchedSegments,
  compareDocuments,
};