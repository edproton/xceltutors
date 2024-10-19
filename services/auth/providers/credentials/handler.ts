import { db } from "@/db";
import { NewUser, userTable } from "@/db/schemas/userSchema";
import { DomainError, Errors } from "@/services/domainError";
import {
  generateVerificationToken,
  verifyToken,
} from "@/services/token/tokenService";
import bcrypt from "bcrypt";

import { sendConfirmationEmail } from "@/services/email/emailService";
import { createSession, generateSessionToken } from "@/services/sessionService";
import { validateSchema } from "@/lib/utils/validationUtils";
import {
  credentialsSignUpFormSchema,
  CredentialsSignUpSchema,
} from "./schemas/signUpSchema";
import {
  credentialsSignInSchema,
  CredentialsSignInSchema,
} from "./schemas/signInSchema";

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

export async function credentialsSignUp(requestData: CredentialsSignUpSchema) {
  validateSchema(credentialsSignUpFormSchema, requestData);

  const existingUser = await db
    .selectFrom(userTable)
    .select("id")
    .where("email", "=", requestData.email)
    .limit(1)
    .executeTakeFirst();

  if (existingUser) {
    throw new DomainError(Errors.User.EmailAlreadyExists);
  }

  const hashedPassword = await bcrypt.hash(requestData.password, 10);

  const newUser: NewUser = {
    email: requestData.email,
    password: hashedPassword,
    isActive: false,
  };

  await db.insertInto(userTable).values(newUser).execute();

  const user = await db
    .selectFrom("user")
    .select(["id", "email", "type"])
    .where("email", "=", newUser.email)
    .executeTakeFirstOrThrow();

  const verificationToken = await generateVerificationToken({
    userId: user.id,
    email: user.email,
  });

  await sendConfirmationEmail(user.email, verificationToken);
}

export async function credentialsSignIn(
  requestData: CredentialsSignInSchema
): Promise<AuthResult> {
  validateSchema(credentialsSignInSchema, requestData);

  const user = await db
    .selectFrom("user")
    .select(["id", "email", "password", "type", "isActive"])
    .where("email", "=", requestData.email)
    .executeTakeFirst();

  if (!user || !user.password) {
    throw new DomainError(Errors.Auth.InvalidCredentials);
  }

  const isPasswordValid = await bcrypt.compare(
    requestData.password,
    user.password
  );
  if (!isPasswordValid) {
    throw new DomainError(Errors.Auth.InvalidCredentials);
  }

  if (!user.isActive) {
    throw new DomainError(Errors.User.NotConfirmed);
  }

  const token = generateSessionToken();
  const session = await createSession(
    token,
    user.id,
    requestData.userAgent,
    requestData.ipAddress
  );

  return {
    token,
    expiresAt: session.expiresAt,
  };
}
