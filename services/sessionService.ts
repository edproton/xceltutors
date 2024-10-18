import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { DomainError } from "../services/domainError";
import { db } from "@/db";
import { SelectUser, userTable } from "@/db/schemas/userSchema";
import {
  SelectSession,
  sessionTable,
  NewSession,
} from "@/db/schemas/sessionSchema";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);

  return encodeBase32LowerCaseNoPadding(bytes);
}

export async function createSession(
  token: string,
  userId: number,
  userAgent: string,
  ipAddress: string
): Promise<SelectSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  const newSession: NewSession = {
    id: sessionId,
    userId: userId,
    expiresAt: expiresAt,
    userAgent: userAgent,
    ipAddress: ipAddress,
  };

  await db.insertInto(sessionTable).values(newSession).execute();

  return newSession;
}

export type SessionValidationResult =
  | { session: SelectSession; user: SelectUser }
  | { session: null; user: null };

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await db
    .selectFrom(sessionTable)
    .innerJoin(userTable, "user.id", "session.userId")
    .select([
      "session.id",
      "session.userId",
      "session.expiresAt",
      "session.userAgent",
      "session.ipAddress",
      "user.id as userId",
      "user.email",
      "user.type",
      "user.isActive",
      "user.password",
    ])
    .where("session.id", "=", sessionId)
    .executeTakeFirst();

  if (!result) {
    return { session: null, user: null };
  }

  const session: SelectSession = {
    id: result.id,
    userId: result.userId,
    expiresAt: result.expiresAt,
    userAgent: result.userAgent,
    ipAddress: result.ipAddress,
  };

  const user: SelectUser = {
    id: result.userId,
    email: result.email,
    type: result.type,
    isActive: result.isActive,
  };

  if (Date.now() >= session.expiresAt.getTime()) {
    await invalidateSession(session.id);
    return { session: null, user: null };
  }

  if (!user.isActive) {
    await invalidateSession(session.id);
    throw new DomainError("User account is not active");
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .updateTable(sessionTable)
      .set({
        expiresAt: newExpiresAt,
      })
      .where("id", "=", session.id)
      .execute();
    session.expiresAt = newExpiresAt;
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.deleteFrom(sessionTable).where("id", "=", sessionId).execute();
}

export async function invalidateAllUserSessions(userId: number): Promise<void> {
  await db.deleteFrom(sessionTable).where("userId", "=", userId).execute();
}
