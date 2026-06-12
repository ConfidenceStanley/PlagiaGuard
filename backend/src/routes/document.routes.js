// backend/src/routes/document.routes.js

const express = require("express");
const router  = express.Router();

// Placeholder - we build this in Phase 4B
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Document routes coming in Phase 4B",
  });
});

module.exports = router;