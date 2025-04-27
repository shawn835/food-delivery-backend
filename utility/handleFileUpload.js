import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (file) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/avif",
    "image/png",
  ];

  const allowedFileSize = 1024 * 1024 * 5; // 5MB

  if (file.size > allowedFileSize) {
    throw new Error("File exceeds limit of 5MB");
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Only ${allowedMimeTypes.join(", ")} are allowed`);
  }

  const res = await cloudinary.uploader.upload(file.filepath, {
    folder: "meals",
  });

  return res.secure_url;
};
