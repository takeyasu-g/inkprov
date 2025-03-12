import { z } from "zod";

const registerSchema = z.object({
  email: z.string(),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters long" }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const settingsSchema = z.object({
    username: z.string(),
    bio: z.string().max(50, { message: "Bio must be less than 50 characters" }),
    matureContent: z.boolean()
  });

  export { registerSchema, settingsSchema };