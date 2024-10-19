import { Generated, Insertable, Selectable } from "kysely";

export const userTable = "user";

export enum UserType {
  tutor = "tutor",
  student = "student",
}

export interface UserTable {
  id: Generated<number>;
  email: string;
  password: string | null;
  type: UserType | null;
  isActive: boolean;
}

export type NewUser = Insertable<UserTable>;
export type SelectUser = Selectable<Omit<UserTable, "password">>;
