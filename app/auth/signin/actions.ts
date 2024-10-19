"use server";

import { setSessionTokenCookie } from "@/lib/utils/cookiesUtils";
import { signIn } from "@/services/auth/authService";
import { SignInFormSchema } from "@/services/auth/authServiceSchemas";
import { headers } from "next/headers";

export const signInAction = async (params: SignInFormSchema) => {
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

  const signInResponse = await signIn({
    ...params,
    ipAddress,
    userAgent,
  });

  setSessionTokenCookie(signInResponse.token, signInResponse.expiresAt);
};
