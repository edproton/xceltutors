import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env.mjs";

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

interface TokenPayload {
  userId: number;
  email: string;
}

export async function generateVerificationToken(
  payload: TokenPayload
): Promise<string> {
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);

  return jwt;
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
