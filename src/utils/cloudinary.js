import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import streamifier from 'streamifier';
// Configuration

// Ensure you load environment variables from your .env file (if not done already)
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Upload a file
const uploadCloudinary = (fileBuffer, fileType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: fileType.startsWith('image') ? 'image' : 'auto' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export { uploadCloudinary };