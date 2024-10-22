import { env } from "@/lib/env.mjs";
import { discordProvider } from "@/services/auth/providers";
import { generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET(): Promise<Response> {
  const state = generateState();
  const url = discordProvider.createAuthorizationURL(state, [
    "identify",
    "email",
  ]);

  cookies().set("discord_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: env.NEXT_PUBLIC_API_URL === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}