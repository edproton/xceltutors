import { cookies } from "next/headers";
import {
  GoogleClaims,
  googleSignIn,
} from "@/services/auth/providers/google/handler";
import { googleProvider } from "@/services/auth/providers";
import { setSessionTokenCookie } from "@/lib/utils/cookiesUtils";
import { decodeIdToken, OAuth2Tokens } from "arctic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const codeVerifier = cookies().get("google_code_verifier")?.value ?? null;

  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  if (state !== storedState) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await googleProvider.validateAuthorizationCode(code, codeVerifier);
  } catch {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }
  const claims = decodeIdToken(tokens.idToken()) as GoogleClaims;
  const authResult = await googleSignIn(claims);

  setSessionTokenCookie(authResult.token, authResult.expiresAt);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/dashboard",
    },
  });
}
