// backend/server.js

const express      = require("express");
const cors         = require("cors");
const dotenv       = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB    = require("./src/config/db");
const lecturerRoutes = require("./src/routes/lecturer.routes");

dotenv.config();
connectDB();

// ── Cloudinary config (call once at startup) ───────────────────────────────
const { connectCloudinary } = require("./src/config/cloudinary");
connectCloudinary();

const app = express();

// ── Core Middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ← added PATCH
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth",      require("./src/routes/auth.routes"));
app.use("/api/documents", require("./src/routes/document.routes"));
app.use("/api/checks",    require("./src/routes/check.routes"));
app.use("/api/lecturer", lecturerRoutes); 
app.use("/api/admin", require("./src/routes/admin.routes"));

// ── Health Check ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to PlagiaGuard API",
    version: "1.0.0",
    status:  "running",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status:  "healthy",
    app:     "PlagiaGuard",
    version: "1.0.0",
  });
});

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});



// ── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`\n🚀 PlagiaGuard API running on http://localhost:${PORT}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV}`);
  console.log(`📁 Max upload: ${process.env.MAX_FILE_SIZE_MB || 10}MB\n`);
});