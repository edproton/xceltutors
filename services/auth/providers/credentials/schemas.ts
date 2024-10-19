import { z } from "zod";
import { passwordSchema } from "@/db/schemas/userSchema";

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" });

export type CredentialsSignUpSchema = z.infer<typeof credentialsSignUpSchema>;
export const credentialsSignUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  ipAddress: z.string(),
  userAgent: z.string(),
});

export type CredentialsSignUpFormSchema = z.infer<
  typeof credentialsSignUpFormSchema
>;
export const credentialsSignUpFormSchema = credentialsSignUpSchema
  .omit({
    ipAddress: true,
    userAgent: true,
  })
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type CredentialsSignInSchema = z.infer<typeof credentialsSignInSchema>;
export const credentialsSignInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string(),
  ipAddress: z.string(),
});

export type CredentialsSignInFormSchema = z.infer<
  typeof credentialsSignInFormSchema
>;
export const credentialsSignInFormSchema = credentialsSignInSchema.omit({
  ipAddress: true,
  userAgent: true,
});
