"use server";

import { UpdateUserSchema, UserType } from "@/db/schemas/userSchema";
import { handleAction } from "@/lib/utils/actionUtils";
import { getUserById, updateUser } from "@/services/userService";

export const getUserByIdAction = (userId: number) =>
  handleAction({
    handler: () => getUserById(userId),
  });

export const updateUserAction = (userData: UpdateUserSchema) =>
  handleAction({
    handler: async () => {
      const result = await updateUser(userData);

      console.log(result);
      return result;
    },
    onSuccess: () => ({
      message: "User updated successfully",
      revalidatePath: "/admin/users",
    }),
  });
