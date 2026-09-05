import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Checks and configures Cloudinary dynamically based on current process.env
 * @returns {typeof cloudinary | null}
 */
export const getCloudinaryClient = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true,
    });
    return cloudinary;
  }
  return null;
};

/**
 * Uploads a local file to Cloudinary with automatic resource detection (image/video)
 * @param {string} localFilePath - Path to file on disk
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<{ url: string, public_id: string, resource_type: string } | null>}
 */
export const uploadToCloudinary = async (localFilePath, folder = 'fomo_media') => {
  const client = getCloudinaryClient();
  if (!client) {
    console.log('⚠️ [Cloudinary] Environment variables not set (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Using local server storage.');
    return null;
  }

  try {
    console.log(`☁️ [Cloudinary] Uploading "${localFilePath}" to folder "${folder}"...`);
    const result = await client.uploader.upload(localFilePath, {
      folder,
      resource_type: 'auto',
    });

    console.log(`✅ [Cloudinary] Upload successful: ${result.secure_url} (${result.resource_type})`);

    // Clean up local temp file after successful cloud upload to save server disk space
    await fs.promises.unlink(localFilePath).catch(() => {});

    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('❌ [Cloudinary] Upload failed:', error.message);
    return null;
  }
};

export default cloudinary;

