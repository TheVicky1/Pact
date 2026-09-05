import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(2, "Use at least 2 characters.").max(80, "Use 80 characters or fewer."),
});
