import { z } from "zod";
import { emailSchema, passwordSchema } from "./sharedSchema";

// Define name schemas
const firstNameSchema = z
  .string()
  .min(2, "First name must be at least 2 characters long");
const lastNameSchema = z
  .string()
  .min(2, "Last name must be at least 2 characters long");

// Service schema
export type CredentialsSignUpSchema = z.infer<typeof credentialsSignUpSchema>;
export const credentialsSignUpSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
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
