// backend/src/services/cloudinary.service.js
const { cloudinary } = require("../config/cloudinary");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { Readable } = require("stream");

// ── Convert buffer to readable stream ──
const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
};

/**
 * Single upload attempt
 */
const attemptUpload = (buffer, originalname, mimetype, uploaderIdStr) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalname).toLowerCase();

    const safeBase = path
      .basename(originalname, path.extname(originalname))
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);

    const uniqueId = uuidv4().replace(/-/g, "").slice(0, 10);

    const uploadOptions = {
      folder:          `plagiarguard/user_${uploaderIdStr}`,
      public_id:       `${safeBase}_${uniqueId}`,
      resource_type:   "raw",
      overwrite:       false,
      use_filename:    false,
      unique_filename: false,
      timeout:         180000, // ← 3 minutes
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary full error:");
          console.error(JSON.stringify(error, null, 2));
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        console.log(`✅ Upload success: ${result.secure_url}`);
        resolve({
          publicId:     result.public_id,
          secureUrl:    result.secure_url,
          url:          result.url,
          resourceType: result.resource_type,
          format:       result.format,
          bytes:        result.bytes,
          createdAt:    result.created_at,
        });
      }
    );

    bufferToStream(buffer).pipe(uploadStream);

    uploadStream.on("error", (err) => {
      reject(new Error(`Upload stream error: ${err.message}`));
    });
  });
};

/**
 * Upload with retry logic
 */
const uploadToCloudinary = async (
  buffer,
  originalname,
  mimetype,
  uploaderIdStr,
  maxRetries = 3
) => {
  console.log(`☁️  Uploading "${originalname}" to Cloudinary...`);
  console.log(`☁️  Cloudinary upload:`);
  console.log(`    File   : ${originalname}`);
  console.log(`    Size   : ${(buffer.length / 1024).toFixed(1)} KB`);
  console.log(`    Folder : plagiarguard/user_${uploaderIdStr}`);

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        const waitMs = attempt * 3000; // 3s, 6s, 9s
        console.log(
          `🔄 Retry ${attempt}/${maxRetries} — waiting ${waitMs / 1000}s...`
        );
        await new Promise((r) => setTimeout(r, waitMs));
      }

      const result = await attemptUpload(
        buffer,
        originalname,
        mimetype,
        uploaderIdStr
      );
      return result;
    } catch (err) {
      lastError = err;
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed: ${err.message}`);

      // Only retry on network/timeout errors
      const isRetryable =
        err.message.includes("Timeout") ||
        err.message.includes("timeout") ||
        err.message.includes("Request Timeout") ||
        err.message.includes("ECONNRESET") ||
        err.message.includes("ENOTFOUND") ||
        err.message.includes("ETIMEDOUT") ||
        err.message.includes("socket") ||
        err.message.includes("network") ||
        err.message.includes("stream");

      if (!isRetryable) {
        console.error("❌ Non-retryable error — stopping retries.");
        throw err;
      }
    }
  }

  throw new Error(
    `Upload failed after ${maxRetries} attempts. ` +
      `Please check your internet connection. Last error: ${lastError.message}`
  );
};

/**
 * Delete a file from Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = "raw") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      timeout: 30000,
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

/**
 * Get info about a file
 */
const getCloudinaryFileInfo = async (publicId, resourceType = "raw") => {
  try {
    return await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    throw new Error(`Cloudinary file info failed: ${error.message}`);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryFileInfo,
};