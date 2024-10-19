import { env } from "@/lib/env.mjs";
import { Google } from "arctic";

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  `${env.NEXT_PUBLIC_API_URL}/auth/providers/google/callback`
);
