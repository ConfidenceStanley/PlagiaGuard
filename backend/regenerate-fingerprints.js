// backend/regenerate-fingerprints.js
// Run with: node regenerate-fingerprints.js

require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("./src/models/Document");
const { generateFingerprint } = require("./src/services/fingerprint.service");

const regenerate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const docs = await Document.find({ isDeleted: false }).select(
    "title cleanedText fingerprint"
  );

  console.log(`Re-generating fingerprints for ${docs.length} documents...\n`);

  for (const doc of docs) {
    if (!doc.cleanedText) {
      console.log(`⚠️  Skipping "${doc.title}" (no cleaned text)`);
      continue;
    }

    const newFingerprint = generateFingerprint(doc.cleanedText);

    doc.fingerprint = newFingerprint;
    // Reset check status so user can re-check
    doc.checkStatus = "unchecked";
    doc.plagiarismScore = null;
    doc.lastChecked = null;

    await doc.save();

    console.log(`✅ "${doc.title}"`);
    console.log(`   Shingles: ${newFingerprint.shingles.length}`);
    console.log(`   MinHashes: ${newFingerprint.minHashes.length}`);
    console.log(`   SimHash: ${newFingerprint.simhash}\n`);
  }

  console.log("✅ All fingerprints regenerated!");
  console.log("👉 Now go re-run the plagiarism checks in the UI");

  process.exit(0);
};

regenerate().catch((err) => {
  console.error(err);
  process.exit(1);
});