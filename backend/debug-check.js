// backend/debug-check.js
require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("./src/models/Document");

const debug = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const docs = await Document.find({ isDeleted: false }).select(
    "title fingerprint cleanedText textStats"
  );

  console.log(`Found ${docs.length} documents\n`);

  // Compare ALL pairs
  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const d1 = docs[i];
      const d2 = docs[j];

      console.log(`─────────────────────────────────────────────`);
      console.log(`"${d1.title}" vs "${d2.title}"`);
      console.log(`─────────────────────────────────────────────`);

      const s1 = new Set(d1.fingerprint?.shingles || []);
      const s2 = new Set(d2.fingerprint?.shingles || []);
      const common = [...s1].filter((s) => s2.has(s));

      console.log(`  Doc 1 shingles: ${s1.size}`);
      console.log(`  Doc 2 shingles: ${s2.size}`);
      console.log(`  Common shingles: ${common.length}`);

      const union = s1.size + s2.size - common.length;
      const jaccard = union === 0 ? 0 : (common.length / union) * 100;
      console.log(`  EXACT Jaccard: ${jaccard.toFixed(1)}%`);

      let minhashMatches = 0;
      const m1 = d1.fingerprint?.minHashes || [];
      const m2 = d2.fingerprint?.minHashes || [];
      for (let k = 0; k < m1.length; k++) {
        if (m1[k] === m2[k]) minhashMatches++;
      }
      console.log(
        `  MinHash matches: ${minhashMatches}/${m1.length} (${((minhashMatches / m1.length) * 100).toFixed(1)}%)`
      );

      console.log(`  SimHash 1: ${d1.fingerprint?.simhash}`);
      console.log(`  SimHash 2: ${d2.fingerprint?.simhash}`);
      console.log(`  Same SimHash?: ${d1.fingerprint?.simhash === d2.fingerprint?.simhash}`);
      console.log("");
    }
  }

  process.exit(0);
};

debug().catch((err) => {
  console.error(err);
  process.exit(1);
});