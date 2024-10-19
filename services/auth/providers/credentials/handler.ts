import { db } from "@/db";
import { CreateUserSchema } from "@/db/schemas/userSchema";
import { DomainError, Errors } from "@/services/domainError";
import {
  generateVerificationToken,
  verifyToken,
} from "@/services/token/tokenService";
import bcrypt from "bcrypt";
import { CredentialsSignInSchema, CredentialsSignUpSchema } from "./schemas";
import { createUser } from "@/services/userService";
import { sendConfirmationEmail } from "@/services/email/emailService";
import { createSession, generateSessionToken } from "@/services/sessionService";

export interface AuthResult {
  token: string;
  expiresAt: Date;
}

export async function credentialsConfirmEmail(token: string) {
  const { userId, email } = await verifyToken(token);

  const existingUser = await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", userId)
    .where("email", "=", email)
    .executeTakeFirst();

  if (!existingUser) {
    throw new DomainError(Errors.User.NotFound);
  }

  if (existingUser.isActive) {
    throw new DomainError(Errors.User.AlreadyConfirmed);
  }

  await db
    .updateTable("user")
    .set({ isActive: true })
    .where("id", "=", userId)
    .where("email", "=", email)
    .execute();
}

export async function credentialsSignUp({
  email,
  password,
}: CredentialsSignUpSchema) {
  const newUser: CreateUserSchema = {
    email,
    password,
    isActive: false,
  };

  await createUser(newUser);

  const user = await db
    .selectFrom("user")
    .select(["id", "email", "type"])
    .where("email", "=", email)
    .executeTakeFirstOrThrow();

  const verificationToken = await generateVerificationToken({
    userId: user.id,
    email: user.email,
  });

  await sendConfirmationEmail(user.email, verificationToken);
}

export async function credentialsSignIn({
  email,
  password,
  ipAddress,
  userAgent,
}: CredentialsSignInSchema): Promise<AuthResult> {
  const user = await db
    .selectFrom("user")
    .select(["id", "email", "password", "type", "isActive"])
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user) {
    throw new DomainError(Errors.Auth.InvalidCredentials);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new DomainError(Errors.Auth.InvalidCredentials);
  }

  if (!user.isActive) {
    throw new DomainError(Errors.User.NotConfirmed);
  }

  const token = generateSessionToken();
  const session = await createSession(token, user.id, userAgent, ipAddress);

  return {
    token,
    expiresAt: session.expiresAt,
  };
}
