import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';
import { IMAGE_CONFIG } from '../utils/constants.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer from multer memory storage to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadImageStream = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      return reject(
        new Error('Cloudinary environment variables are missing. Please configure them in your .env file.')
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: IMAGE_CONFIG.CLOUDINARY_FOLDER || 'nutrilens/meals',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the image to delete.
 * @returns {Promise<any>}
 */
export const deleteImage = async (publicId) => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary not configured. Skipping image deletion.');
    return null;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

export default {
  uploadImageStream,
  deleteImage,
};
