"use server";

import { cache } from "react";
import { DomainError, Errors } from "@/services/domainError";
import { db } from "@/db";
import { userTable } from "@/db/schemas/userSchema";
import { sessionTable } from "@/db/schemas/sessionSchema";
import { getCurrentSession } from "@/lib/utils/cookiesUtils";
import { roleTable, RoleType, userRoleTable } from "@/db/schemas/roleSchema";
import { SessionData } from "./types";
import { DomainResponse, wrapDomainError } from "@/lib/utils/actionUtils";

export type UserRoles = {
  id: number;
  name: RoleType;
}[];

export async function getUserRoles(userId: number): Promise<UserRoles> {
  try {
    const roles = db
      .selectFrom(roleTable)
      .innerJoin(userRoleTable, "role.id", "userRole.roleId")
      .select(["role.id", "role.name"])
      .where("userRole.userId", "=", userId)
      .execute();

    return roles;
  } catch (error) {
    console.error("Error in getUserRoles:", error);
    throw new DomainError(Errors.User.NotFound);
  }
}

export const getUserBySession = cache(
  async (): Promise<DomainResponse<SessionData>> => {
    return wrapDomainError(async () => {
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
    });
  }
);
