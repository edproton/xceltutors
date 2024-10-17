"use server";

import { signUp, signIn, signOut } from "@/services/auth/authService";
import {
  SignInSchema,
  SignUpFormSchema,
  SignUpSchema,
} from "@/services/auth/authServiceSchemas";
import { cookies, headers } from "next/headers";

export const signUpAction = async (params: SignUpFormSchema) => {
  console.log(params);

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

export const signInAction = async (params: SignInSchema) => {
  const headersList = headers();
  const cookieStore = cookies();

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

  const response = await signIn({
    ...params,
    ipAddress,
    userAgent,
  });

  // Set a session cookie
  if (response.token) {
    cookieStore.set("session", response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });
  }
};

export const signOutAction = (sessionId: string) => signOut(sessionId);
