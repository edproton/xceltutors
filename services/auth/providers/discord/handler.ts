import { db } from "@/db";
import { NewUser, userTable } from "@/db/schemas/userSchema";
import { DomainError, Errors } from "@/services/domainError";
import { createSession, generateSessionToken } from "@/services/sessionService";

export interface AuthResult {
  token: string;
  expiresAt: Date;
}

export interface DiscordClaims {
  sub: string;
  name: string;
  picture: string | null;
  email: string;
}

async function findUserByDiscordId(discordId: string) {
  return db
    .selectFrom(userTable)
    .selectAll()
    .where("discordId", "=", discordId)
    .executeTakeFirst();
}

async function findUserByEmail(email: string) {
  return db
    .selectFrom(userTable)
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();
}

async function updateUser(userId: number, updatedData: Partial<NewUser>) {
  await db
    .updateTable(userTable)
    .set(updatedData)
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
  const session = await createSession(token, userId, "Discord OAuth", "");
  return { token, expiresAt: session.expiresAt };
}

export async function discordSignIn(
  claims: DiscordClaims
): Promise<AuthResult> {
  const { sub: discordId, picture, email, name: fullName } = claims;
  const [firstName, ...lastNameParts] = fullName.split(" ");
  const lastName = lastNameParts.join(" ");

  const userByDiscordId = await findUserByDiscordId(discordId);
  if (userByDiscordId) {
    if (!userByDiscordId.isActive) {
      throw new DomainError(Errors.User.NotConfirmed);
    }

    await updateUser(userByDiscordId.id, {
      discordId,
      firstName,
      lastName,
      picture,
    });

    return createAuthResult(userByDiscordId.id);
  }

  const userByEmail = await findUserByEmail(email);
  if (userByEmail) {
    if (!userByEmail.isActive) {
      throw new DomainError(Errors.User.NotConfirmed);
    }

    await updateUser(userByEmail.id, {
      discordId,
      firstName,
      lastName,
      picture,
    });

    return createAuthResult(userByEmail.id);
  }

  const newDiscordUser: NewUser = {
    firstName,
    lastName,
    email,
    picture,
    discordId,
    isActive: true,
    type: null,
    password: null,
  };

  const newUserId = await createUserWithGoogleInfo(newDiscordUser);
  return createAuthResult(newUserId);
}
