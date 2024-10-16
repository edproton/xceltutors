import { z } from "zod";
import { Generated, Insertable, Selectable } from "kysely";

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
export type SelectUser = Selectable<UserTable>;

export const userTable = "user";

const userTypeSchema = z.nativeEnum(UserType);
export const userSchema = z.object({
  id: z.number(),
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z
    .string()
    .trim()
    .min(8, { message: "Password must be at least 8 characters long" }),
  type: userTypeSchema,
  isActive: z.boolean(),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export const createUserSchema = userSchema.omit({ id: true });

export type UpdateUserSchema = z.infer<typeof userSchema>;
export const updateUserSchema = userSchema.partial();

export type SelectUserSchema = z.infer<typeof userSchema>;
