import { z } from "zod";
import { passwordSchema, UserType } from "@/db/schemas/userSchema";

const userTypeSchema = z.nativeEnum(UserType);

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Invalid email address" });

export type SignUpSchema = z.infer<typeof signUpSchema>;
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  type: userTypeSchema,
  ipAddress: z.string(),
  userAgent: z.string(),
});

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
export const signUpFormSchema = signUpSchema
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

export type SignInSchema = z.infer<typeof signInSchema>;
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string(),
  ipAddress: z.string(),
});
