import { z } from "zod";
import { Generated, Insertable, Selectable } from "kysely";

export const userTable = "user";

export enum UserType {
  tutor = "tutor",
  student = "student",
}

export interface UserTable {
  id: Generated<number>;
  email: string;
  password: string;
  type: UserType;
  isActive: boolean;
}

export type NewUser = Insertable<UserTable>;
export type SelectUser = Selectable<Omit<UserTable, "password">>;

// DTOs
export const passwordSchema = z
  .string()
  .trim()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(30, { message: "Password must not exceed 30 characters" });

export const userTypeSchema = z.nativeEnum(UserType);
export const userSchema = z.object({
  id: z.number(),
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: passwordSchema,
  type: userTypeSchema,
  isActive: z.boolean(),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export const createUserSchema = userSchema.omit({ id: true });

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export const updateUserSchema = userSchema.extend({
  password: z
    .union([passwordSchema, z.string().trim().max(0)])
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
});

export type SelectUserSchema = Omit<z.infer<typeof userSchema>, "password">;
