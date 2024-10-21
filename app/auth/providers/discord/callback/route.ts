import { cookies, headers } from "next/headers";
import { discordSignIn } from "@/services/auth/providers/discord/handler";
import { discordProvider } from "@/services/auth/providers";
import { setSessionTokenCookie } from "@/lib/utils/cookiesUtils";
import { OAuth2Tokens } from "arctic";
import { OAuthClaims } from "@/services/auth/providers/oauthHandler";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("discord_oauth_state")?.value ?? null;

  if (code === null || state === null || storedState === null) {
    return new Response("Please restart the process.", { status: 400 });
  }

  if (state !== storedState) {
    return new Response("Please restart the process.", { status: 400 });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await discordProvider.validateAuthorizationCode(code);
  } catch (error) {
    console.error("Error validating authorization code:", error);
    return new Response("Failed to validate authorization code.", {
      status: 400,
    });
  }

  // Fetch user profile from Discord API
  try {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with status ${response.status}`);
    }

    const discordUser = await response.json();

    const claims: OAuthClaims = {
      sub: discordUser.id,
      name: discordUser.username,
      picture: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      email: discordUser.email,
    };

    const ipAddress = headers().get("x-forwarded-for") || "unknown";
    const userAgent = headers().get("user-agent") || "unknown";
    const authResult = await discordSignIn(claims, ipAddress, userAgent);

    setSessionTokenCookie(authResult.token, authResult.expiresAt);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/dashboard",
      },
    });
  } catch (error) {
    console.error("Error fetching Discord user profile:", error);
    return new Response("Failed to fetch user profile from Discord.", {
      status: 500,
    });
  }
}
