import { NextFunction, Request, Response } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    console.log("File", file);
    if (file.mimetype.startsWith("image/") || file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error("Only image and mp4 video files are allowed"));
    }
  },
});

// Explicitly type the uploadSingle function
export const uploadSingle =
  (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, next);
  };

// Explicitly type the uploadSingle function
export const uploadMulti =
  (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName)(req, res, next);
  };
