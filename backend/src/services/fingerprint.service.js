// backend/src/services/fingerprint.service.js
// COMPLETELY REWRITTEN — deterministic, correct algorithms

const crypto = require("crypto");
const { extractNGrams } = require("../utils/textProcessor");

// ─── Constants ────────────────────────────────────────────────────────────────
const SHINGLE_SIZE = 5;
const NUM_HASH_FUNCTIONS = 128;
const SIMHASH_BITS = 64;
const MAX_SHINGLES_STORED = 2000;  // Increased from 500

// ─── Pre-computed hash function parameters (DETERMINISTIC) ────────────────────
// Using a fixed seed ensures same input always produces same minhash
const HASH_PARAMS = (() => {
  const PRIME = 2147483647;
  const params = [];
  // Use seeded RNG (linear congruential generator)
  let state = 1234567;
  for (let i = 0; i < NUM_HASH_FUNCTIONS; i++) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const a = (state % (PRIME - 1)) + 1;
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const b = state % PRIME;
    params.push({ a, b });
  }
  return params;
})();

const PRIME = 2147483647;

// ─── Hash a string to integer (32-bit) ──
const hashStringToInt = (str) => {
  const hash = crypto.createHash("md5").update(str).digest();
  // Take first 4 bytes as unsigned 32-bit int
  return hash.readUInt32BE(0) % PRIME;
};

// ─── Hash a string to 64-bit binary (for SimHash) ──
const hashStringToBigInt = (str) => {
  const hash = crypto.createHash("sha256").update(str).digest();
  // Take first 8 bytes
  const high = hash.readUInt32BE(0);
  const low = hash.readUInt32BE(4);
  return (BigInt(high) << 32n) | BigInt(low);
};

// ─── Generate shingles from cleaned text ────────────────────────────────────
const generateShingles = (cleanedText, n = SHINGLE_SIZE) => {
  if (!cleanedText || cleanedText.length < n * 3) return [];

  const ngrams = extractNGrams(cleanedText, n);
  // Deduplicate
  return [...new Set(ngrams)];
};

// ─── Hash shingles for storage ──────────────────────────────────────────────
const hashShingles = (shingles) => {
  return shingles.map((s) =>
    crypto.createHash("sha1").update(s).digest("hex").slice(0, 12)
  );
};

// ─── Generate MinHash signature (DETERMINISTIC) ─────────────────────────────
const generateMinHash = (shingles) => {
  if (!shingles || shingles.length === 0) {
    return new Array(NUM_HASH_FUNCTIONS).fill(0);
  }

  // Pre-hash all shingles to integers
  const shingleInts = shingles.map((s) => hashStringToInt(s));

  // For each hash function, find the minimum hash value
  const signature = new Array(NUM_HASH_FUNCTIONS);

  for (let i = 0; i < NUM_HASH_FUNCTIONS; i++) {
    const { a, b } = HASH_PARAMS[i];
    let minVal = PRIME;

    for (let j = 0; j < shingleInts.length; j++) {
      // Linear hash function: (a*x + b) mod prime
      const h = (a * shingleInts[j] + b) % PRIME;
      if (h < minVal) minVal = h;
    }

    signature[i] = minVal;
  }

  return signature;
};

// ─── Generate SimHash fingerprint ───────────────────────────────────────────
const generateSimHash = (cleanedText) => {
  if (!cleanedText) return "0".repeat(16);

  const words = cleanedText.split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return "0".repeat(16);

  // Build weighted vector
  const vector = new Array(SIMHASH_BITS).fill(0);

  for (const word of words) {
    const hash = hashStringToBigInt(word);

    for (let i = 0; i < SIMHASH_BITS; i++) {
      const bit = (hash >> BigInt(SIMHASH_BITS - 1 - i)) & 1n;
      if (bit === 1n) {
        vector[i] += 1;
      } else {
        vector[i] -= 1;
      }
    }
  }

  // Convert to fingerprint (positive bits → 1)
  let fingerprint = 0n;
  for (let i = 0; i < SIMHASH_BITS; i++) {
    if (vector[i] > 0) {
      fingerprint |= 1n << BigInt(SIMHASH_BITS - 1 - i);
    }
  }

  return fingerprint.toString(16).padStart(16, "0");
};

// ─── Main: Generate complete fingerprint ────────────────────────────────────
const generateFingerprint = (cleanedText) => {
  if (!cleanedText || cleanedText.trim().length === 0) {
    return {
      shingles: [],
      shingleHashes: [],
      minHashes: new Array(NUM_HASH_FUNCTIONS).fill(0),
      simhash: "0".repeat(16),
    };
  }

  const allShingles = generateShingles(cleanedText);
  const storedShingles = allShingles.slice(0, MAX_SHINGLES_STORED);

  // Use ALL shingles for MinHash (more accurate)
  const minHashes = generateMinHash(allShingles);
  const simhash = generateSimHash(cleanedText);

  return {
    shingles: storedShingles,
    shingleHashes: hashShingles(storedShingles),
    minHashes,
    simhash,
  };
};

// ─── Estimate Jaccard from MinHash signatures ───────────────────────────────
const estimateJaccardSimilarity = (sig1, sig2) => {
  if (!sig1 || !sig2 || sig1.length === 0) return 0;
  if (sig1.length !== sig2.length) return 0;

  let matches = 0;
  for (let i = 0; i < sig1.length; i++) {
    if (sig1[i] === sig2[i]) matches++;
  }

  return matches / sig1.length;
};

// ─── Compute SimHash similarity (1 - hamming distance / 64) ─────────────────
const computeSimHashSimilarity = (hash1, hash2) => {
  if (!hash1 || !hash2) return 0;

  try {
    const n1 = BigInt("0x" + hash1);
    const n2 = BigInt("0x" + hash2);
    let xor = n1 ^ n2;

    let hammingDist = 0;
    while (xor > 0n) {
      if (xor & 1n) hammingDist++;
      xor >>= 1n;
    }

    return 1 - hammingDist / SIMHASH_BITS;
  } catch {
    return 0;
  }
};

// ─── EXACT Jaccard (for verification) ────────────────────────────────────────
const exactJaccardSimilarity = (shingles1, shingles2) => {
  if (!shingles1?.length || !shingles2?.length) return 0;

  const set1 = new Set(shingles1);
  const set2 = new Set(shingles2);

  let intersection = 0;
  for (const s of set1) {
    if (set2.has(s)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

module.exports = {
  generateFingerprint,
  generateShingles,
  hashShingles,
  generateMinHash,
  generateSimHash,
  estimateJaccardSimilarity,
  computeSimHashSimilarity,
  exactJaccardSimilarity,
};