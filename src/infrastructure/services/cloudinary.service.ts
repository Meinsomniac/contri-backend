import cloudinary from "@infrastructure/config/cloudinary.config";
import { Readable } from "stream";

export interface UploadResult {
  url: string;
  publicId: string;
}

export default class CloudinaryService {
  static async uploadStream(
    buffer: Buffer,
    folder: string
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else if (result?.secure_url) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          } else {
            reject(
              new Error("Cloudinary upload failed: No secure URL returned")
            );
          }
        }
      );
      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });
  }

  static getSignedUrl(
    publicId: string,
    expiresIn: number = 60 * 60 * 8 // 8 hours
  ): string {
    return cloudinary.url(publicId, {
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    });
  }

  // static async deleteImage(publicId: string): Promise<void> {}
}
