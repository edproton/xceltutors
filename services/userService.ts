import { validateSchema } from "@/lib/utils/validationUtils";
import { db } from "../db";
import {
  userTable,
  NewUser,
  CreateUserSchema,
  SelectUser,
  createUserSchema,
  UpdateUserSchema,
  SelectUserSchema,
} from "../db/schemas/userSchema";
import bcrypt from "bcrypt";
import DomainError from "./domainError";
import { SelectSession, sessionTable } from "@/db/schemas/sessionSchema";
import { invalidateAllUserSessions } from "./sessionService";

export async function createUser(user: CreateUserSchema): Promise<void> {
  validateSchema(createUserSchema, user);

  const existingUser = await db
    .selectFrom(userTable)
    .select("id")
    .where("email", "=", user.email)
    .limit(1)
    .executeTakeFirst();

  if (existingUser) {
    throw new DomainError("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const newUser: NewUser = {
    email: user.email,
    password: hashedPassword,
    type: user.type,
    isActive: user.isActive,
  };

  await db.insertInto(userTable).values(newUser).execute();
}

export async function updateUser(userData: UpdateUserSchema): Promise<void> {
  const emailAlreadyAssigned = await db
    .selectFrom(userTable)
    .select("id")
    .where("email", "=", userData.email)
    .limit(1)
    .executeTakeFirst();

  if (emailAlreadyAssigned && emailAlreadyAssigned.id !== userData.id) {
    throw new DomainError("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  await db
    .updateTable(userTable)
    .set({
      email: userData.email,
      type: userData.type,
      isActive: userData.isActive,
      password: hashedPassword,
    })
    .where("id", "=", userData.id)
    .execute();
}

export async function getUserById(id: number): Promise<SelectUser | undefined> {
  const existingUser = await db
    .selectFrom(userTable)
    .selectAll()
    .where("id", "=", id)
    .limit(1)
    .executeTakeFirst();

  if (!existingUser) {
    throw new DomainError("User with this email already exists");
  }

  return existingUser;
}

export async function getAllUsers(): Promise<SelectUserSchema[]> {
  return db.selectFrom(userTable).selectAll().orderBy("id").execute();
}

export async function getUserSessions(
  userId: number
): Promise<SelectSession[]> {
  return db
    .selectFrom(sessionTable)
    .selectAll()
    .where("userId", "=", userId)
    .orderBy("expiresAt", "desc")
    .execute();
}
