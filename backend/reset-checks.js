// backend/reset-checks.js
require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("./src/models/Document");
const PlagiarismCheck = require("./src/models/PlagiarismCheck");

const reset = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected\n");

  // Delete all checks
  const deleted = await PlagiarismCheck.deleteMany({});
  console.log(`🗑️  Deleted ${deleted.deletedCount} check records`);

  // Reset all documents
  const updated = await Document.updateMany(
    { isDeleted: false },
    {
      $set: {
        checkStatus: "unchecked",
        plagiarismScore: null,
        lastChecked: null,
      },
    }
  );
  console.log(`🔄 Reset ${updated.modifiedCount} documents`);

  console.log("\n✅ Done! Now click 'Check Plagiarism' in UI again.");
  process.exit(0);
};

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});