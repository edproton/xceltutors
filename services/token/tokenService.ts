import { JWTVerifyResult, SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env.mjs";
import { DomainError, Errors } from "../domainError";

interface TokenPayload {
  userId: number;
  email: string;
}

export async function generateVerificationToken(
  payload: TokenPayload
): Promise<string> {
  try {
    const secretKey = new TextEncoder().encode(env.JWT_SECRET);

    const jwt = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey);

    return jwt;
  } catch (error) {
    console.error("Error generating verification token:", error);
    throw new Error("Failed to generate verification token");
  }
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  if (!token) {
    throw new DomainError(Errors.Auth.InvalidToken);
  }

  const secretKey = new TextEncoder().encode(env.JWT_SECRET);

  const { payload }: JWTVerifyResult = await jwtVerify(token, secretKey, {
    algorithms: ["HS256"],
  });

  // Validate payload structure
  if (!payload || typeof payload !== "object") {
    throw new DomainError(Errors.Auth.InvalidToken);
  }

  const { userId, email } = payload as unknown as TokenPayload;
  if (!userId || !email) {
    throw new DomainError(Errors.Auth.InvalidToken);
  }

  // Check if token is expired
  const currentTime = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < currentTime) {
    throw new DomainError(Errors.Auth.TokenExpired);
  }

  return { userId, email };
}
