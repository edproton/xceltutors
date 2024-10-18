import { validateSchema } from "@/lib/utils/validationUtils";
import { db } from "../db";
import {
  userTable,
  NewUser,
  CreateUserSchema,
  createUserSchema,
  UpdateUserSchema,
  SelectUserSchema,
} from "../db/schemas/userSchema";
import bcrypt from "bcrypt";
import { DomainError, Errors } from "./domainError";
import { SelectSession, sessionTable } from "@/db/schemas/sessionSchema";

export async function createUser(user: CreateUserSchema): Promise<void> {
  validateSchema(createUserSchema, user);

  const existingUser = await db
    .selectFrom(userTable)
    .select("id")
    .where("email", "=", user.email)
    .limit(1)
    .executeTakeFirst();

  if (existingUser) {
    throw new DomainError(Errors.User.EmailAlreadyExists);
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
    throw new DomainError(Errors.User.EmailAlreadyExists);
  }

  const updateObject: Partial<UpdateUserSchema> = {
    email: userData.email,
    type: userData.type,
    isActive: userData.isActive,
  };

  if (userData.password) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    updateObject.password = hashedPassword;
  }

  await db
    .updateTable(userTable)
    .set(updateObject)
    .where("id", "=", userData.id)
    .execute();
}

export async function getUserById(id: number): Promise<SelectUserSchema> {
  const existingUser = await db
    .selectFrom(userTable)
    .select(["id", "email", "type", "isActive"])
    .where("id", "=", id)
    .limit(1)
    .executeTakeFirst();

  if (!existingUser) {
    throw new DomainError(Errors.User.NotFound);
  }

  return existingUser;
}

export async function getAllUsers(): Promise<SelectUserSchema[]> {
  return db
    .selectFrom(userTable)
    .select(["id", "email", "type", "isActive"])
    .orderBy("id")
    .execute();
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
