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

export const getUserByIdAction = (userId: number) => getUserById(userId);

export const updateUserAction = (userData: UpdateUserSchema) =>
  updateUser(userData);

export const getUserSessionsAction = (userId: number) =>
  getUserSessions(userId);

export const invalidateUserSessionAction = (sessionId: string) =>
  invalidateSession(sessionId);

export const invalidateAllSessionsAction = (userId: number) =>
  invalidateAllUserSessions(userId);
