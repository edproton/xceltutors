import { z } from "zod";
import { emailSchema, passwordSchema } from "./sharedSchema";

export type CredentialsSignUpSchema = z.infer<typeof credentialsSignUpSchema>;
export const credentialsSignUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  ipAddress: z.string(),
  userAgent: z.string(),
});

// Form schema
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
