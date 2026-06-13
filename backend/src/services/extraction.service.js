// backend/src/services/extraction.service.js
const path = require("path");
const mammoth = require("mammoth");

// ── pdf-parse v1.1.1 exports the function directly ──
const pdfParse = require("pdf-parse");
console.log("✅ pdf-parse loaded, type:", typeof pdfParse);

// ─────────────────────────────────────────────────────────────────────────────

const extractFromPDF = async (buffer) => {
  if (typeof pdfParse !== "function") {
    throw new Error(
      `pdf-parse is not callable (type: ${typeof pdfParse}). ` +
      `Run: npm remove pdf-parse && npm install pdf-parse@1.1.1`
    );
  }

  try {
    const data = await pdfParse(buffer);

    if (!data || !data.text || data.text.trim().length === 0) {
      throw new Error(
        "No extractable text found in PDF. " +
          "The file may be image-based (scanned) or completely empty."
      );
    }

    console.log(
      `   ✅ PDF extracted: ${data.numpages} pages, ${data.text.length} chars`
    );
    return data.text;
  } catch (error) {
    if (
      error.message.includes("No extractable text") ||
      error.message.includes("scanned") ||
      error.message.includes("empty")
    ) {
      throw error;
    }
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const extractFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages && result.messages.length > 0) {
      const warnings = result.messages
        .filter((m) => m.type === "warning")
        .map((m) => m.message);
      if (warnings.length > 0) {
        console.warn("⚠️  DOCX warnings:", warnings.join(", "));
      }
    }

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("No extractable text found in DOCX file.");
    }

    console.log(`   ✅ DOCX extracted: ${result.value.length} chars`);
    return result.value;
  } catch (error) {
    if (error.message.includes("No extractable text")) throw error;
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const extractFromDOC = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    if (result.value && result.value.trim().length > 0) {
      console.log(`   ✅ DOC extracted via mammoth: ${result.value.length} chars`);
      return result.value;
    }
  } catch {}

  try {
    const raw = buffer
      .toString("utf8")
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s{3,}/g, " ")
      .trim();

    if (raw.length > 100) {
      console.log(`   ✅ DOC extracted via raw text: ${raw.length} chars`);
      return raw;
    }
  } catch {}

  throw new Error(
    "Could not extract text from this DOC file. " +
      "Please convert it to DOCX or PDF and re-upload."
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const extractFromTXT = async (buffer) => {
  try {
    let text = buffer.toString("utf8");

    const controlCharRatio =
      (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length /
      Math.max(text.length, 1);

    if (controlCharRatio > 0.05) {
      console.warn("⚠️  UTF-8 looks garbled, trying latin1...");
      text = buffer.toString("latin1");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("TXT file appears to be empty.");
    }

    console.log(`   ✅ TXT extracted: ${text.length} chars`);
    return text;
  } catch (error) {
    if (error.message.includes("empty")) throw error;
    throw new Error(`TXT extraction failed: ${error.message}`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const extractText = async (buffer, originalname, mimetype) => {
  const ext = path.extname(originalname).toLowerCase();

  console.log(`\n📄 Extracting text`);
  console.log(`   File : "${originalname}"`);
  console.log(`   Ext  : "${ext}"`);
  console.log(`   MIME : "${mimetype}"`);
  console.log(`   Size : ${(buffer.length / 1024).toFixed(1)} KB`);

  let text;
  let fileType;

  switch (ext) {
    case ".pdf":
      text = await extractFromPDF(buffer);
      fileType = "pdf";
      break;
    case ".docx":
      text = await extractFromDOCX(buffer);
      fileType = "docx";
      break;
    case ".doc":
      text = await extractFromDOC(buffer);
      fileType = "doc";
      break;
    case ".txt":
      text = await extractFromTXT(buffer);
      fileType = "txt";
      break;
    default:
      throw new Error(
        `Unsupported file type: "${ext}". Supported: .pdf, .docx, .doc, .txt`
      );
  }

  if (!text || text.trim().length < 10) {
    throw new Error(
      "Extracted text is too short. The document may be empty or unreadable."
    );
  }

  console.log(
    `   ✅ Extraction complete — ${text.length} chars, type: ${fileType}\n`
  );

  return { text, fileType };
};

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  extractText,
  extractFromPDF,
  extractFromDOCX,
  extractFromDOC,
  extractFromTXT,
};