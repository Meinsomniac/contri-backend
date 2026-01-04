import { Request, Response, NextFunction } from "express";
import logger from "@shared/utils/logger";

export interface AppError extends Error {
  statusCode?: number;
}

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

export const errorHandler = (
  error: AppError,
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Log the error
  logger.error(`${error.name}: ${message} - ${req.method} ${req.url}`, {
    stack: error.stack,
    userId: req.user?.id, // Assuming user is attached to req if authenticated
    ip: req.ip,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
