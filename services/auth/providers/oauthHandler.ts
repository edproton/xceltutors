import { db } from "@/db";
import { NewUser, userTable } from "@/db/schemas/userSchema";
import { DomainError, Errors } from "@/services/domainError";
import { createSession, generateSessionToken } from "@/services/sessionService";

export enum ProviderType {
  Google = "Google",
  Discord = "Discord",
}

export interface AuthResult {
  token: string;
  expiresAt: Date;
}

export interface OAuthClaims {
  sub: string;
  name: string;
  picture: string | null;
  email: string;
}

type ProviderIdField = {
  [K in ProviderType]: string;
};

const providerIdFields: ProviderIdField = {
  [ProviderType.Google]: "googleId",
  [ProviderType.Discord]: "discordId",
};

function getIdField(providerType: ProviderType): string {
  return providerIdFields[providerType];
}

async function findUserByProviderId(
  providerType: ProviderType,
  providerId: string
) {
  const { ref } = db.dynamic;

  const idField = getIdField(providerType);
  return db
    .selectFrom(userTable)
    .selectAll()
    .where(ref(idField), "=", providerId)
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

async function createUser(newUser: NewUser) {
  const result = await db
    .insertInto(userTable)
    .values(newUser)
    .returning("id")
    .executeTakeFirstOrThrow();
  return result.id;
}

async function createAuthResult(
  userId: number,
  providerType: ProviderType
): Promise<AuthResult> {
  const token = generateSessionToken();
  const session = await createSession(
    token,
    userId,
    `${providerType} OAuth`,
    ""
  );
  return { token, expiresAt: session.expiresAt };
}

export async function oauthSignIn(
  claims: OAuthClaims,
  providerType: ProviderType
): Promise<AuthResult> {
  const { sub: providerId, picture, email, name: fullName } = claims;
  const [firstName, ...lastNameParts] = fullName.split(" ");
  const lastName = lastNameParts.join(" ");
  const idField = getIdField(providerType);

  const userByProviderId = await findUserByProviderId(providerType, providerId);
  if (userByProviderId) {
    if (!userByProviderId.isActive) {
      throw new DomainError(Errors.User.NotConfirmed);
    }

    await updateUser(userByProviderId.id, {
      [idField]: providerId,
      firstName,
      lastName,
      picture,
    });

    return createAuthResult(userByProviderId.id, providerType);
  }

  const userByEmail = await findUserByEmail(email);
  if (userByEmail) {
    if (!userByEmail.isActive) {
      throw new DomainError(Errors.User.NotConfirmed);
    }

    await updateUser(userByEmail.id, {
      [idField]: providerId,
      firstName,
      lastName,
      picture,
    });

    return createAuthResult(userByEmail.id, providerType);
  }

  const newUser: NewUser = {
    firstName,
    lastName,
    email,
    picture,
    [idField]: providerId,
    isActive: true,
    type: null,
    password: null,
  };

  const newUserId = await createUser(newUser);
  return createAuthResult(newUserId, providerType);
}
