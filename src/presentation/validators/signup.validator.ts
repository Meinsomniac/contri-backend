import z from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address").optional(),
  phone: z.string().min(10, "Invalid phone number").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});
