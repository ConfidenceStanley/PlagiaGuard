// src/utils/textProcessor.js
// Text cleaning and preprocessing pipeline

/**
 * Remove excessive whitespace and normalize line breaks
 */
const normalizeWhitespace = (text) => {
  return text
    .replace(/\r\n/g, "\n")       // Windows line endings
    .replace(/\r/g, "\n")          // Old Mac line endings
    .replace(/\t/g, " ")           // Tabs to spaces
    .replace(/[ ]{2,}/g, " ")      // Multiple spaces to one
    .replace(/\n{3,}/g, "\n\n")    // Max 2 consecutive newlines
    .trim();
};

/**
 * Remove special characters but keep sentence structure
 */
const removeSpecialChars = (text) => {
  return text
    .replace(/[^\w\s.,!?;:'"()\-\n]/g, " ")  // Keep common punctuation
    .replace(/[ ]{2,}/g, " ")
    .trim();
};

/**
 * Convert to lowercase for comparison purposes
 */
const toLowercase = (text) => text.toLowerCase();

/**
 * Remove common stop words (for fingerprinting only)
 * Keep original text intact for display
 */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
  "for", "of", "with", "by", "from", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "shall", "can",
  "this", "that", "these", "those", "i", "you", "he", "she", "it",
  "we", "they", "me", "him", "her", "us", "them", "my", "your",
  "his", "its", "our", "their", "what", "which", "who", "not",
  "as", "if", "so", "up", "out", "no", "than", "then", "its",
  "about", "into", "through", "during", "before", "after", "above",
  "below", "between", "each", "more", "also", "there"
]);

const removeStopWords = (text) => {
  return text
    .split(/\s+/)
    .filter((word) => !STOP_WORDS.has(word.toLowerCase()))
    .join(" ");
};

/**
 * Extract sentences from text
 */
const extractSentences = (text) => {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20); // Ignore very short fragments

  return sentences;
};

/**
 * Extract n-grams from text (for shingling)
 * @param {string} text - Input text
 * @param {number} n    - N-gram size (default: 5 words)
 */
const extractNGrams = (text, n = 5) => {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const ngrams = [];

  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(" "));
  }

  return ngrams;
};

/**
 * Count words in text
 */
const countWords = (text) => {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
};

/**
 * Count characters (excluding spaces)
 */
const countCharacters = (text) => {
  return text.replace(/\s/g, "").length;
};

/**
 * Count sentences in text
 */
const countSentences = (text) => {
  return (text.match(/[.!?]+/g) || []).length;
};

/**
 * Full preprocessing pipeline for display text
 * Cleans but preserves readability
 */
const preprocessForDisplay = (rawText) => {
  let text = normalizeWhitespace(rawText);
  text = removeSpecialChars(text);
  return text;
};

/**
 * Full preprocessing pipeline for comparison/fingerprinting
 * More aggressive cleaning
 */
const preprocessForComparison = (rawText) => {
  let text = normalizeWhitespace(rawText);
  text = removeSpecialChars(text);
  text = toLowercase(text);
  text = removeStopWords(text);
  text = normalizeWhitespace(text); // Clean up again after stop word removal
  return text;
};

/**
 * Generate text statistics
 */
const getTextStats = (rawText, cleanText) => {
  return {
    wordCount: countWords(rawText),
    characterCount: countCharacters(rawText),
    sentenceCount: countSentences(rawText),
    paragraphCount: (rawText.split(/\n{2,}/) || []).length,
    avgWordsPerSentence:
      countSentences(rawText) > 0
        ? Math.round(countWords(rawText) / countSentences(rawText))
        : 0,
    cleanWordCount: countWords(cleanText),
  };
};

module.exports = {
  preprocessForDisplay,
  preprocessForComparison,
  extractSentences,
  extractNGrams,
  getTextStats,
  normalizeWhitespace,
  removeStopWords,
  countWords,
};