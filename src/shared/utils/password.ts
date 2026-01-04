import bcrypt from "bcryptjs";

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
