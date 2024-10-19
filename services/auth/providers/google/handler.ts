import { db } from "@/db";
import { NewUser, userTable } from "@/db/schemas/userSchema";
import { DomainError, Errors } from "@/services/domainError";
import { createSession, generateSessionToken } from "@/services/sessionService";

export interface AuthResult {
  token: string;
  expiresAt: Date;
}

export interface GoogleClaims {
  sub: string;
  name: string;
  picture: string;
  email: string;
}

async function findUserByGoogleId(googleId: string) {
  return db
    .selectFrom(userTable)
    .selectAll()
    .where("googleId", "=", googleId)
    .executeTakeFirst();
}

async function findUserByEmail(email: string) {
  return db
    .selectFrom(userTable)
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();
}

async function updateUserWithGoogleInfo(
  userId: number,
  googleInfo: Partial<NewUser>
) {
  await db
    .updateTable(userTable)
    .set(googleInfo)
    .where("id", "=", userId)
    .execute();
}

async function createUserWithGoogleInfo(newUser: NewUser) {
  const result = await db
    .insertInto(userTable)
    .values(newUser)
    .returning("id")
    .executeTakeFirstOrThrow();
  return result.id;
}

async function createAuthResult(userId: number): Promise<AuthResult> {
  const token = generateSessionToken();
  const session = await createSession(token, userId, "Google OAuth", "");
  return { token, expiresAt: session.expiresAt };
}

export async function googleSignIn(claims: GoogleClaims): Promise<AuthResult> {
  const { sub: googleId, picture, email, name: fullName } = claims;
  const [firstName, ...lastNameParts] = fullName.split(" ");
  const lastName = lastNameParts.join(" ");

  const userByGoogleId = await findUserByGoogleId(googleId);
  if (userByGoogleId) {
    if (!userByGoogleId.isActive) {
      throw new DomainError(Errors.User.NotConfirmed);
    }

    await updateUserWithGoogleInfo(userByGoogleId.id, {
      googleId,
      firstName,
      lastName,
      picture,
    });

    return createAuthResult(userByGoogleId.id);
  }

  const userByEmail = await findUserByEmail(email);
  if (userByEmail) {
    if (!userByEmail.isActive) {
      throw new DomainError(Errors.User.NotConfirmed);
    }

    await updateUserWithGoogleInfo(userByEmail.id, {
      googleId,
      firstName,
      lastName,
      picture,
    });

    return createAuthResult(userByEmail.id);
  }

  const newGoogleUser: NewUser = {
    firstName,
    lastName,
    email,
    picture,
    googleId,
    isActive: true,
    type: null,
    password: null,
  };

  const newUserId = await createUserWithGoogleInfo(newGoogleUser);
  return createAuthResult(newUserId);
}
