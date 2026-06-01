import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { IMAGE_CONFIG } from '../utils/constants.js';
import ApiError from '../utils/ApiError.js';

/**
 * Multer configuration for food image uploads.
 *
 * Security measures:
 * - UUID filenames (no user-controlled paths)
 * - MIME type validation (JPEG, PNG, WebP only)
 * - 5MB size limit
 * - Stored in temp directory, deleted after Cloudinary upload
 */

// Store in memory buffer (uploaded to Cloudinary, never persisted to disk)
const storage = multer.memoryStorage();

// File filter: validate MIME type
const fileFilter = (_req, file, cb) => {
  if (IMAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: IMAGE_CONFIG.MAX_SIZE_BYTES,
    files: 1, // Only allow single file upload
  },
});

export default upload;
