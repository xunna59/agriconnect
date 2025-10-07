const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

// Allowed image types
const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];

// 5MB size limit (you can adjust)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Use memory storage (buffer)
const storage = multer.memoryStorage();

// File filter for validating file type and size
const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed."), false);
  }
  cb(null, true);
};

// Configure multer with limits and file filter
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Reusable middleware for uploading files to Cloudinary
 * @param {string} fieldName - The form field name
 * @param {object} options - { multiple: boolean, maxCount: number, folder: string }
 */
const uploadToCloudinary = (fieldName, options = {}) => {
  const { multiple = false, maxCount = 10, folder = "uploads" } = options;

  return async (req, res, next) => {
    const multerHandler = multiple
      ? upload.array(fieldName, maxCount)
      : upload.single(fieldName);

    multerHandler(req, res, async (err) => {
      if (err) {
        // Handle common Multer errors nicely
        let message = "Upload error";

        if (err.message.includes("File too large")) {
          message = `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
        } else if (err.message.includes("Invalid file type")) {
          message = err.message;
        }

        return res.status(400).json({ error: message });
      }

      const files = multiple ? req.files : [req.file];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      try {
        const uploadPromises = files.map((file) => {
          return new Promise((resolve, reject) => {
            // Sanitize file name: remove spaces & special chars
            const cleanName = file.originalname
              .replace(/\s+/g, "_") // replace spaces
              .replace(/[^a-zA-Z0-9._-]/g, "") // remove unsafe chars
              .replace(/\.[^/.]+$/, ""); // remove extension

            const publicId = `${cleanName}_${Date.now()}`;

            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder,
                public_id: publicId,
                resource_type: "auto", // handles all image types
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
              }
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          });
        });

        const urls = await Promise.all(uploadPromises);

        // Attach uploaded URLs to request for next middleware
        req.uploadedFiles = multiple ? urls : urls[0];

        next();
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ error: "Image upload failed. Please try again." });
      }
    });
  };
};

module.exports = uploadToCloudinary;
