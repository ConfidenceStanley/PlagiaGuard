// backend/src/config/cloudinary.js
const cloudinary = require("cloudinary").v2;

let isConfigured = false;

const connectCloudinary = () => {
  const { 
    CLOUDINARY_CLOUD_NAME, 
    CLOUDINARY_API_KEY, 
    CLOUDINARY_API_SECRET 
  } = process.env;

  // ── Validate all three are present ──────────────────────
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error("❌ Cloudinary config missing! Check your .env file:");
    console.error(`   CLOUDINARY_CLOUD_NAME : ${CLOUDINARY_CLOUD_NAME ? "✅" : "❌ MISSING"}`);
    console.error(`   CLOUDINARY_API_KEY    : ${CLOUDINARY_API_KEY    ? "✅" : "❌ MISSING"}`);
    console.error(`   CLOUDINARY_API_SECRET : ${CLOUDINARY_API_SECRET ? "✅" : "❌ MISSING"}`);
    process.exit(1); // Stop server — no point running without storage
  }

  cloudinary.config({
    cloud_name : CLOUDINARY_CLOUD_NAME,
    api_key    : CLOUDINARY_API_KEY,
    api_secret : CLOUDINARY_API_SECRET,
    secure     : true,
  });

  isConfigured = true;

  // ── Show partial key for verification (never log full secret) ──
  console.log("☁️  Cloudinary configured:");
  console.log(`    Cloud : ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`    Key   : ${CLOUDINARY_API_KEY.slice(0, 4)}${"*".repeat(CLOUDINARY_API_KEY.length - 4)}`);
};

const getCloudinary = () => {
  if (!isConfigured) {
    throw new Error("Cloudinary not configured. Call connectCloudinary() first.");
  }
  return cloudinary;
};

module.exports = { cloudinary, connectCloudinary, getCloudinary };