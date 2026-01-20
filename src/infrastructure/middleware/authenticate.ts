import { AppError } from "@shared/error/AppError";
import { decodeToken } from "@shared/utils/token";
import { Request, Response, NextFunction } from "express";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;
  const token = authorization?.split(" ")?.[1];

  if (!token) throw new AppError("No authorization token was found", 401);

  const { iat, exp, ...user } = decodeToken(token);
  if (Date.now() > exp * 1000) throw new AppError("Token expired", 401);

  req.user = user;
  next();
};
