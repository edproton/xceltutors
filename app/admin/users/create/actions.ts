"use server";

import { createUser } from "@/services/userService";
import { CreateUserSchema } from "@/db/schemas/userSchema";
import { handleAction } from "@/lib/utils/actionUtils";

export const createUserAction = (userData: CreateUserSchema) =>
  handleAction({
    handler: () => createUser(userData),
    onSuccess: () => ({
      message: "User created successfully",
      revalidatePath: "/admin/users",
    }),
  });
