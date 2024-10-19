"use server";

import { signUp } from "@/services/auth/authService";
import { SignUpFormSchema } from "@/services/auth/authServiceSchemas";
import { headers } from "next/headers";

export const signUpAction = async (params: SignUpFormSchema) => {
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

  await signUp({
    ...params,
    ipAddress,
    userAgent,
  });
};