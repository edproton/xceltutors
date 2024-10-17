"use server";

import { createUser } from "@/services/userService";
import { CreateUserSchema } from "@/db/schemas/userSchema";

export const createUserAction = (userData: CreateUserSchema) =>
  createUser(userData);
