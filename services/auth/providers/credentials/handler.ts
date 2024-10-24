import { db } from "@/db";
import { NewUser, userTable } from "@/db/schemas/userSchema";
import { DomainError, Errors } from "@/services/domainError";
import {
  generateVerificationToken,
  verifyToken,
} from "@/services/token/tokenService";
import * as argon2 from "argon2";

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
import { AuthProvider } from "../types";

export interface AuthResult {
  token: string;
  expiresAt: Date;
}

export async function credentialsConfirmEmail(token: string) {
  const { userId, email } = await verifyToken(token);

  const existingUser = await db
    .selectFrom(userTable)
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
    .updateTable(userTable)
    .set({ isActive: true })
    .where("id", "=", userId)
    .where("email", "=", email)
    .execute();
}

export async function credentialsSignUp(requestData: CredentialsSignUpSchema) {
  validateSchema(credentialsSignUpFormSchema, requestData);

  const existingUser = await db
    .selectFrom(userTable)
    .select(["id", "googleId", "discordId", "isActive", "password"])
    .where("email", "=", requestData.email)
    .limit(1)
    .executeTakeFirst();

  const hashedPassword = await argon2.hash(requestData.password);

  if (existingUser) {
    if (existingUser.password) {
      throw new DomainError(Errors.Auth.ProviderCredentialsAlreadyExists);
    }

    // User exists but only with Google or Discord account
    await db
      .updateTable(userTable)
      .set({
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        password: hashedPassword,
        isActive: true, // Assuming the Google/Discord account is already active
      })
      .where("id", "=", existingUser.id)
      .execute();

    // No need to send confirmation email as the account is already active
    return;
  }

  // New user creation
  const newUser: NewUser = {
    firstName: requestData.firstName,
    lastName: requestData.lastName,
    email: requestData.email,
    password: hashedPassword,
    isActive: false,
  };

  const insertResult = await db
    .insertInto(userTable)
    .values(newUser)
    .returning(["id", "email"])
    .executeTakeFirstOrThrow();

  const verificationToken = await generateVerificationToken({
    userId: insertResult.id,
    email: insertResult.email,
  });

  await sendConfirmationEmail(insertResult.email, verificationToken);
}

export async function credentialsSignIn(
  requestData: CredentialsSignInSchema
): Promise<AuthResult> {
  validateSchema(credentialsSignInSchema, requestData);

  const user = await db
    .selectFrom(userTable)
    .select(["id", "email", "password", "type", "isActive"])
    .where("email", "=", requestData.email)
    .executeTakeFirst();

  if (!user || !user.password) {
    throw new DomainError(Errors.Auth.InvalidCredentials);
  }

  const isPasswordValid = await argon2.verify(
    user.password,
    requestData.password
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
    requestData.ipAddress,
    AuthProvider.Discord
  );

  return {
    token,
    expiresAt: session.expiresAt,
  };
}
