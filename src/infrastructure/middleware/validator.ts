import { AppError } from "@shared/error/AppError";
import { ZodError, ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

export const validator = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error?.issues
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        next(new AppError(message, 400));
      } else {
        next(new AppError("Validation failed", 400));
      }
    }
  };
};
