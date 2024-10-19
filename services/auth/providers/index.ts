import { env } from "@/lib/env.mjs";
import { Discord, Google } from "arctic";

export const googleProvider = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  buildCallbackUrl("google")
);

export const discordProvider = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  buildCallbackUrl("discord")
);

function buildCallbackUrl(providerName: string) {
  return `${env.NEXT_PUBLIC_API_URL}/auth/providers/${providerName}/callback`;
}
