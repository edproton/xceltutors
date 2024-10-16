"use server";

import { UpdateUserSchema } from "@/db/schemas/userSchema";
import { handleAction } from "@/lib/utils/actionUtils";
import {
  invalidateAllUserSessions,
  invalidateSession,
} from "@/services/sessionService";
import {
  getUserById,
  getUserSessions,
  updateUser,
} from "@/services/userService";

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

export const getUserSessionsAction = (userId: number) =>
  handleAction({
    handler: () => getUserSessions(userId),
  });

export const invalidateUserSessionAction = (sessionId: string) =>
  handleAction({
    handler: () => invalidateSession(sessionId),
    onSuccess: () => ({
      message: "Session invalidated successfully",
      revalidatePath: "/admin/users/[userId]",
    }),
  });

export const invalidateAllSessionsAction = (userId: number) =>
  handleAction({
    handler: () => invalidateAllUserSessions(userId),
    onSuccess: () => ({
      message: "All sessions invalidated successfully",
      revalidatePath: "/admin/users/[userId]",
    }),
  });
