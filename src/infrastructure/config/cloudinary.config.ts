import "dotenv/config";
import { v2 as cloudinary, ConfigOptions } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ACCOUNT_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
} as ConfigOptions);

export default cloudinary;
