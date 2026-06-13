// backend/src/services/webSearch.service.js
// Web-based plagiarism detection using Serper Google Search API

const axios = require("axios");
const { extractSentences } = require("../utils/textProcessor");

// ─── Configuration ────────────────────────────────────────────────────────────
const SERPER_API_URL = "https://google.serper.dev/search";
const MAX_QUERIES_PER_CHECK = 8;        // Limit API costs
const MIN_QUERY_LENGTH = 30;            // Min chars for meaningful query
const MAX_QUERY_LENGTH = 200;           // Google search query limit
const SIMILARITY_THRESHOLD = 0.7;       // 70% word overlap = match
const RESULTS_PER_QUERY = 5;            // Top 5 results per query

// ─── Pick best phrases to search ──────────────────────────────────────────────
/**
 * Select the most "searchable" sentences from a document
 * Avoids: too short, too long, too generic
 */
const selectSearchablePhrases = (text, maxPhrases = MAX_QUERIES_PER_CHECK) => {
  const sentences = extractSentences(text);

  // Filter quality sentences
  const candidates = sentences
    .filter((s) => {
      const len = s.length;
      const wordCount = s.split(/\s+/).length;
      return (
        len >= MIN_QUERY_LENGTH &&
        len <= MAX_QUERY_LENGTH &&
        wordCount >= 6 &&
        wordCount <= 25 &&
        !/^(figure|table|chapter|section)/i.test(s) && // Skip captions
        !/^\d/.test(s) // Skip sentences starting with numbers
      );
    })
    .map((s) => ({
      text: s,
      wordCount: s.split(/\s+/).length,
      // Score: prefer medium-length sentences with diverse vocabulary
      score: s.split(/\s+/).length * (s.length / 100),
    }))
    .sort((a, b) => b.score - a.score);

  // Spread selections across the document
  const totalCandidates = candidates.length;
  if (totalCandidates <= maxPhrases) {
    return candidates.map((c) => c.text);
  }

  // Pick evenly distributed phrases
  const step = Math.floor(totalCandidates / maxPhrases);
  const selected = [];
  for (let i = 0; i < maxPhrases; i++) {
    selected.push(candidates[i * step].text);
  }

  return selected;
};

// ─── Search Google via Serper ──────────────────────────────────────────────────
const searchWeb = async (query) => {
  if (!process.env.SERPER_API_KEY) {
    throw new Error("SERPER_API_KEY not set in .env");
  }

  try {
    // Wrap in quotes for exact phrase search
    const wrappedQuery = `"${query.slice(0, MAX_QUERY_LENGTH)}"`;

    const response = await axios.post(
      SERPER_API_URL,
      {
        q: wrappedQuery,
        num: RESULTS_PER_QUERY,
      },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return response.data.organic || [];
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Invalid SERPER_API_KEY");
    }
    if (error.response?.status === 429) {
      throw new Error("Rate limit reached. Try again later.");
    }
    console.error(`     ⚠️  Search failed: ${error.message}`);
    return [];
  }
};

// ─── Compute word overlap between query and result snippet ──────────────────
const computeOverlap = (query, snippet) => {
  if (!snippet) return 0;

  const queryWords = new Set(
    query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  const snippetWords = new Set(
    snippet
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  if (queryWords.size === 0) return 0;

  let matches = 0;
  for (const w of queryWords) {
    if (snippetWords.has(w)) matches++;
  }

  return matches / queryWords.size;
};

// ─── Main: Detect plagiarism from web sources ──────────────────────────────
/**
 * Search the web for instances of the document's content
 * @param {Object} document - Document to check (needs extractedText)
 * @returns {Object} Web search results
 */
const detectWebPlagiarism = async (document) => {
  const startTime = Date.now();

  if (!process.env.SERPER_API_KEY) {
    console.log("⚠️  Web search skipped (no SERPER_API_KEY)");
    return {
      enabled: false,
      sources: [],
      queriesUsed: 0,
      message: "Web search not configured",
    };
  }

  const text = document.extractedText || "";
  if (text.length < 100) {
    return {
      enabled: true,
      sources: [],
      queriesUsed: 0,
      message: "Document too short for web search",
    };
  }

  console.log(`\n🌐 Starting web search check...`);

  // ── 1. Select search phrases ──
  const phrases = selectSearchablePhrases(text);
  console.log(`   Selected ${phrases.length} phrases to search`);

  if (phrases.length === 0) {
    return {
      enabled: true,
      sources: [],
      queriesUsed: 0,
      message: "No searchable phrases found",
    };
  }

  // ── 2. Search each phrase ──
  const webMatches = new Map(); // URL → match data (dedupe by URL)

  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i];
    console.log(`   [${i + 1}/${phrases.length}] Searching: "${phrase.slice(0, 60)}..."`);

    try {
      const results = await searchWeb(phrase);

      for (const result of results) {
        const overlap = computeOverlap(phrase, result.snippet);

        if (overlap >= SIMILARITY_THRESHOLD) {
          const existing = webMatches.get(result.link);

          if (existing) {
            // Already found this URL — update with stronger match
            if (overlap > existing.maxOverlap) {
              existing.maxOverlap = overlap;
            }
            existing.matchedPhrases.push({
              phrase,
              snippet: result.snippet,
              overlap: Math.round(overlap * 100),
            });
          } else {
            // New URL match
            webMatches.set(result.link, {
              url: result.link,
              title: result.title || "Untitled",
              snippet: result.snippet || "",
              maxOverlap: overlap,
              matchedPhrases: [
                {
                  phrase,
                  snippet: result.snippet,
                  overlap: Math.round(overlap * 100),
                },
              ],
            });
          }
        }
      }
    } catch (err) {
      console.error(`     ❌ Search error: ${err.message}`);
      // Continue with other phrases on error
    }

    // Small delay to be nice to API
    await new Promise((r) => setTimeout(r, 200));
  }

  // ── 3. Build sources array (sorted by relevance) ──
  const sources = Array.from(webMatches.values())
    .map((m) => ({
      sourceUrl: m.url,
      sourceTitle: m.title,
      sourceSnippet: m.snippet,
      overallSimilarity: Math.round(m.maxOverlap * 100 * 10) / 10,
      matchedPhrasesCount: m.matchedPhrases.length,
      matchedPhrases: m.matchedPhrases,
      sourceType: "web",
    }))
    .sort((a, b) => b.matchedPhrasesCount - a.matchedPhrasesCount)
    .slice(0, 10); // Top 10 web sources

  const elapsed = Date.now() - startTime;
  console.log(`✅ Web search complete in ${elapsed}ms`);
  console.log(`   Web sources found: ${sources.length}`);
  console.log(`   API queries used: ${phrases.length}\n`);

  return {
    enabled: true,
    sources,
    queriesUsed: phrases.length,
    processingTime: elapsed,
  };
};

module.exports = {
  detectWebPlagiarism,
  selectSearchablePhrases,
};