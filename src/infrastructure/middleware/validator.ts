import { AppError } from "@shared/error/AppError";
import { ZodError, ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

export const validator = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const query = JSON.parse(JSON.stringify(req.query));
    const params = JSON.parse(JSON.stringify(req.params));
    const body = req.body || {};

    const payload = {
      ...(Object.keys(body).length && { body }),
      ...(Object.keys(params).length && { params }),
      ...(Object.keys(query).length && { query }),
    };

    try {
      schema.parse(payload);
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
