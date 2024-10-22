"use server";

import { cache } from "react";
import { DomainError, Errors } from "@/services/domainError";
import { db } from "@/db";
import { userTable } from "@/db/schemas/userSchema";
import { sessionTable } from "@/db/schemas/sessionSchema";
import { getCurrentSession } from "@/lib/utils/cookiesUtils";

export const getUserBySession = cache(async () => {
  try {
    const sessionToken = await getCurrentSession();
    console.log(sessionToken);
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

    // You might want to return both user and session info
    return {
      user,
      session: { id: sessionId, expiresAt: expiresAt },
    };
  } catch (error) {
    if (error instanceof DomainError) {
      throw error; // Re-throw domain errors
    }
    // Log the error for debugging purposes
    console.error("Error in getUserBySession:", error);
    throw new DomainError(Errors.User.NotFound);
  }
});
