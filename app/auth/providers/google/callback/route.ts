import { cookies } from "next/headers";
import { decodeIdToken, type OAuth2Tokens } from "arctic";
import { google } from "@/services/auth/oauthProviders";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
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
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  const claims = decodeIdToken(tokens.idToken()) as {
    sub?: string;
    name?: string;
    picture?: string;
    email?: string;
  };

  const googleId = claims.sub;
  const picture = claims.picture;
  const email = claims.email;

  // todo validate if google id already exists
  // let user = await getUserByOAuthProvider(ProviderType.Google, googleId!);
  // if (!user) {
  //   user = await getUserByEmail(email);
  //   if (!user) {
  //     user = await createUser({
  //       email,
  //       name: name || null,
  //     });
  //   }
  // }

  // // todo save user
  // await createOrUpdateOAuthProvider({
  //   userId: user.id,
  //   providerType: ProviderType.Google,
  //   providerId: googleId,
  //   accessToken: tokens.accessToken(),
  //   refreshToken: tokens.refreshToken() || null,
  //   expiresAt: tokens.expiresIn()
  //     ? new Date(Date.now() + tokens.expiresIn() * 1000)
  //     : null,
  // });

  // const sessionToken = generateSessionToken();
  // const session = await createSession(
  //   sessionToken,
  //   user.id,
  //   request.headers.get("user-agent") || "",
  //   request.headers.get("x-forwarded-for") ||
  //     request.headers.get("x-real-ip") ||
  //     "unknown",
  //   ProviderType.Google
  // );

  // setSessionTokenCookie(sessionToken, session.expiresAt);
  console.log("email", email);
  console.log("googleId", googleId);
  console.log("picture", picture);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}
