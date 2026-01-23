import { VerificationType } from "@infrastructure/database/generated/prisma/enums";
import z from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    phone: z.string().min(10, "Invalid phone number").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(12, "Password must be less or equal to 12 characters"),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").min(1, "Email is required"),
    password: z
      .string("Password is required to login")
      .min(8, "Password must be at least 8 characters")
      .max(12, "Password must be less or equal to 12 characters"),
  }),
});

export const sentEmailOtpSchema = z.object({
  query: z.object({
    email: z.email("Invalid email address").min(1, "Email is required"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    otp: z.string("Empty otp in not allowed").min(6, "Invalid Otp"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string("Old password is required")
      .min(8, "Old password must be at least 8 characters")
      .max(12, "Old password must be less or equal to 12 characters"),
    newPassword: z
      .string("New password is required")
      .min(8, "New password must be at least 8 characters")
      .max(12, "New password must be less or equal to 12 characters"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(12, "Password must be less or equal to 12 characters"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    otp: z.string("Empty otp in not allowed").min(6, "Invalid Otp"),
  }),
});

export const updateUserProfileSchema = z.object({
  body: z.object({
    id: z.string("Invalid user id"),
    name: z.string().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
    phone: z.string().optional(),
  }),
});
