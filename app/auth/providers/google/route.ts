import { env } from "@/lib/env";
import { googleProvider } from "@/services/auth/providers";
import { generateState, generateCodeVerifier } from "arctic";
import { cookies } from "next/headers";

export async function GET(): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = googleProvider.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  cookies().set("google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: env.NEXT_PUBLIC_API_URL === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });
  cookies().set("google_code_verifier", codeVerifier, {
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
