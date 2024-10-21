import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { DomainError, Errors } from "../services/domainError";
import { db } from "@/db";
import { userTable } from "@/db/schemas/userSchema";
import {
  SelectSession,
  sessionTable,
  NewSession,
} from "@/db/schemas/sessionSchema";
import { ProviderType } from "./auth/providers/oauthHandler";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);

  return encodeBase32LowerCaseNoPadding(bytes);
}

export async function createSession(
  token: string,
  userId: number,
  userAgent: string,
  ipAddress: string,
  providerType: ProviderType
): Promise<SelectSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  const newSession: NewSession = {
    id: sessionId,
    userId: userId,
    expiresAt: expiresAt,
    userAgent: userAgent,
    ipAddress: ipAddress,
    providerType: providerType,
  };

  await db.insertInto(sessionTable).values(newSession).execute();

  return newSession;
}

export async function validateSessionToken(token: string): Promise<string> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await db
    .selectFrom(sessionTable)
    .innerJoin(userTable, "user.id", "session.userId")
    .select([
      "session.id as sessionId",
      "session.expiresAt as sessionExpiresAt",
      "user.id as userId",
      "user.isActive as userIsActive",
    ])
    .where("session.id", "=", sessionId)
    .executeTakeFirst();

  if (!result) {
    throw new DomainError(Errors.Auth.InvalidSession);
  }

  const session: Pick<SelectSession, "id" | "expiresAt"> = {
    id: result.sessionId,
    expiresAt: result.sessionExpiresAt,
  };

  if (Date.now() >= session.expiresAt.getTime()) {
    await invalidateSession(session.id);

    throw new DomainError(Errors.Auth.SessionExpired);
  }

  if (!result.userIsActive) {
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

  return sessionId;
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.deleteFrom(sessionTable).where("id", "=", sessionId).execute();
}

export async function invalidateAllUserSessions(userId: number): Promise<void> {
  await db.deleteFrom(sessionTable).where("userId", "=", userId).execute();
}
