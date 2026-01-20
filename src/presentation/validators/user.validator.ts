import z from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    phone: z.string().min(10, "Invalid phone number").optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const sentEmailOtpSchema = z.object({
  query: z.object({
    email: z.email("Invalid email address").min(1, "Email is required"),
  }),
});

export const verifyOtpSchema = z.object({
  query: z.object({
    otp: z.string().min(6, "Invalid Otp"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string()
      .min(8, "Old password must be at least 8 characters"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});
