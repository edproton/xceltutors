import { Generated, Insertable, Selectable } from "kysely";

export const userTable = "user";

export enum UserType {
  Tutor = "tutor",
  Student = "student",
}

export interface UserTable {
  id: Generated<number>;
  firstName: string;
  lastName: string;
  email: string;
  password: string | null;
  type: UserType | null;
  isActive: boolean;
  googleId: string | null;
  discordId: string | null;
  picture: string | null;
}

export type NewUser = Insertable<UserTable>;
export type SelectUser = Selectable<Omit<UserTable, "password">>;
