import jwt from "jsonwebtoken";
import "dotenv/config";
import { User } from "@domain/entities/user.entity";

export interface GenerateTokenResponse {
  accessToken: string;
  refreshToken: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env
  .JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_REFRESH_EXPIRES_IN = process.env
  .JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"];

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not defined in environment variables");
}

export const generateAccessToken = (user: Record<string, any>): string => {
  const { hashedPassword, ...payload } = user;
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
    // allowInvalidAsymmetricKeyTypes: true,
  });
};

export const generateRefreshToken = (user: Record<string, any>): string => {
  return jwt.sign(user, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    algorithm: "HS256",
    // allowInvalidAsymmetricKeyTypes: true,
  });
};

export const generateTokens = (user: object): GenerateTokenResponse => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

export const decodeToken = (
  token: string,
): User & { iat: number; exp: number } => {
  const decoded = jwt.decode(token, {
    complete: true,
  });

  const payload = decoded?.payload as User & { iat: number; exp: number };
  return payload;
};
