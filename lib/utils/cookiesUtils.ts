// @lib/utils/cookiesUtils.ts

import { cookies } from "next/headers";
import { env } from "../env.mjs";
import {
  SessionValidationResult,
  validateSessionToken,
} from "@/services/sessionService";
import { cache } from "react";

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

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = cookies().get("session")?.value ?? null;
    if (token === null) {
      return { session: null, userId: null };
    }

    const result = await validateSessionToken(token);

    return result;
  }
);
