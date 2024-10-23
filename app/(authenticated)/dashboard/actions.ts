"use server";

import { cache } from "react";
import { DomainError, Errors } from "@/services/domainError";
import { db } from "@/db";
import { SelectUser, userTable } from "@/db/schemas/userSchema";
import { sessionTable } from "@/db/schemas/sessionSchema";
import { getCurrentSession } from "@/lib/utils/cookiesUtils";
import { roleTable, SelectRole, userRoleTable } from "@/db/schemas/roleSchema";

export async function getUserRoles(userId: number): Promise<SelectRole[]> {
  try {
    const roles = db
      .selectFrom(roleTable)
      .innerJoin(userRoleTable, "role.id", "userRole.roleId")
      .selectAll()
      .where("userRole.userId", "=", userId)
      .execute();

    return roles;
  } catch (error) {
    console.error("Error in getUserRoles:", error);
    throw new DomainError(Errors.User.NotFound);
  }
}

// Session info type
export type SessionInfo = {
  id: string;
  expiresAt: Date;
};

// Complete session data type
export type SessionData = {
  user: SelectUser;
  roles: SelectRole[];
  session: SessionInfo;
};

// Updated getUserBySession with proper return type
export const getUserBySession = cache(async (): Promise<SessionData> => {
  try {
    const sessionToken = await getCurrentSession();

    const result = await db
      .selectFrom(sessionTable)
      .innerJoin(userTable, "user.id", "session.userId")
      .selectAll("user")
      .select(["session.id as sessionId", "session.expiresAt"])
      .where("session.id", "=", sessionToken)
      .executeTakeFirst();

    if (!result) {
      throw new DomainError(Errors.Auth.Unauthenticated);
    }

    // Destructure to separate user fields from session fields
    const { sessionId, expiresAt, ...user } = result;

    // Get user roles
    const roles = await getUserRoles(user.id);

    return {
      user: result,
      roles,
      session: { id: sessionId, expiresAt },
    } satisfies SessionData;
  } catch (error) {
    if (error instanceof DomainError) {
      throw error;
    }

    console.error("Error in getUserBySession:", error);
    throw new DomainError(Errors.User.NotFound);
  }
});
