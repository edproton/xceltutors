"use server";

import { setSessionTokenCookie } from "@/lib/utils/cookiesUtils";
import { credentialsSignIn } from "@/services/auth/providers/credentials/handler";
import { headers } from "next/headers";
import { CredentialsSignInFormSchema } from "@/services/auth/providers/credentials/schemas/signInSchema";

export const credentialsSignInAction = async (
  params: CredentialsSignInFormSchema
) => {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "Unknown";

  // Get IP address
  let ipAddress = headersList.get("x-forwarded-for");
  // If x-forwarded-for is not available, fall back to x-real-ip
  if (!ipAddress) {
    ipAddress = headersList.get("x-real-ip");
  }
  // If neither header is available, use a placeholder
  if (!ipAddress) {
    ipAddress = "Unknown";
  }
  // If there are multiple IP addresses, take the first one
  ipAddress = ipAddress.split(",")[0].trim();

  const signInResponse = await credentialsSignIn({
    ...params,
    ipAddress,
    userAgent,
  });

  setSessionTokenCookie(signInResponse.token, signInResponse.expiresAt);
};
