import { db } from "@/db";
import { CreateUserSchema } from "@/db/schemas/userSchema";
import bcrypt from "bcrypt";
import { SignUpSchema, SignInSchema } from "./authServiceSchemas";
import { createSession, generateSessionToken } from "../sessionService";
import { createUser } from "../userService";
import { sendConfirmationEmail } from "../email/emailService";
import { generateVerificationToken, verifyToken } from "../token/tokenService";
import { DomainError, Errors } from "../domainError";

export interface AuthResult {
  token: string;
  expiresAt: Date;
}

export async function confirmEmail(token: string) {
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

export async function signUp({ email, password }: SignUpSchema) {
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

export async function signIn({
  email,
  password,
  ipAddress,
  userAgent,
}: SignInSchema): Promise<AuthResult> {
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
