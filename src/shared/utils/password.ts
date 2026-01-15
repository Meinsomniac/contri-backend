import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export const hashPassword = (password: string): string => {
  if (!password) {
    throw new Error("Password is required for hashing");
  }
  return bcrypt.hashSync(password, SALT_ROUNDS);
};

export const comparePassword = (
  plainPassword: string,
  hashedPassword: string
): boolean => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

export const generateTotp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateTotpSecret = (otp: string): string => {
  return hashPassword(otp);
};

export const compareOtp = (otp: string, hashedOtp: string) => {
  return comparePassword(otp, hashedOtp);
};
