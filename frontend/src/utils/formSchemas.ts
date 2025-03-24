import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }), // Validate email format
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }), // Validate email format
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  rememberMe: z.boolean().default(true).optional(),
});

const settingsSchema = z.object({
  username: z.string(),
  bio: z.string().max(180, { message: "Bio must be less than 180 characters" }),
});

export { registerSchema, loginSchema, settingsSchema };
