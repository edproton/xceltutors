import { db } from "@/db";
import { createUser } from "./userService";
import { createSession, generateSessionToken } from "./sessionService";
import { CreateUserSchema, UserType } from "@/db/schemas/userSchema";
import { SelectSession } from "@/db/schemas/sessionSchema";
import bcrypt from "bcrypt";
import DomainError from "./domainError";

export interface SignUpParams {
  email: string;
  password: string;
  type: UserType;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: number;
    email: string;
    type: UserType;
  };
  session: SelectSession;
  token: string;
}

export async function signUp({
  email,
  password,
  type,
}: SignUpParams): Promise<AuthResult> {
  const newUser: CreateUserSchema = {
    email,
    password,
    type,
    isActive: false,
  };

  console.log(newUser);

  await createUser(newUser);

  const user = await db
    .selectFrom("user")
    .select(["id", "email", "type"])
    .where("email", "=", email)
    .executeTakeFirstOrThrow();

  const token = generateSessionToken();
  const session = await createSession(token, user.id);

  return {
    user,
    session,
    token,
  };
}

export async function signIn({
  email,
  password,
}: SignInParams): Promise<AuthResult> {
  const user = await db
    .selectFrom("user")
    .select(["id", "email", "password", "type", "isActive"])
    .where("email", "=", email)
    .executeTakeFirst();

  if (!user) {
    throw new DomainError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new DomainError("Invalid email or password");
  }

  if (!user.isActive) {
    throw new DomainError("User account is not active");
  }

  const token = generateSessionToken();
  const session = await createSession(token, user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      type: user.type,
    },
    session,
    token,
  };
}

export async function signOut(sessionId: string): Promise<void> {
  await db.deleteFrom("session").where("id", "=", sessionId).execute();
}
