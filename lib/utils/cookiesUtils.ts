// @lib/utils/cookiesUtils.ts

import { cookies } from "next/headers";
import { env } from "../env.mjs";
import { validateSessionToken } from "@/services/sessionService";
import { cache } from "react";
import { DomainError, Errors } from "@/services/domainError";

export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  cookies().set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export function deleteSessionTokenCookie(): void {
  cookies().set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export const getCurrentSession = cache(async (): Promise<string> => {
  const token = cookies().get("session")?.value ?? null;
  if (token === null) {
    throw new DomainError(Errors.Auth.Unauthenticated);
  }

  const result = await validateSessionToken(token);

  return result;
});
