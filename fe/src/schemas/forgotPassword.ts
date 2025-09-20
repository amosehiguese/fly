import { z } from "zod";

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const forgotPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().min(6, "Code must be 6 characters").max(7, "Code must be 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ForgotPasswordRequestValues = z.infer<typeof forgotPasswordRequestSchema>;
export type ForgotPasswordResetValues = z.infer<typeof forgotPasswordResetSchema>;
