import { z } from "zod";
import { emailSchema, passwordSchema } from "./sharedSchema";

// Service schema
export type CredentialsSignInSchema = z.infer<typeof credentialsSignInSchema>;
export const credentialsSignInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string(),
  ipAddress: z.string(),
});

// Form schema
export type CredentialsSignInFormSchema = z.infer<
  typeof credentialsSignInFormSchema
>;
export const credentialsSignInFormSchema = credentialsSignInSchema.omit({
  ipAddress: true,
  userAgent: true,
});
