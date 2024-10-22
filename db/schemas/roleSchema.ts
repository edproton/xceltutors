import { Generated, Insertable, Selectable } from "kysely";

export const roleTable = "role";
export const userRoleTable = "user_role";

export enum RoleType {
  admin = "admin",
  moderator = "moderator",
}

export interface RoleTable {
  id: Generated<number>;
  name: RoleType;
  createdAt: Generated<Date>;
}

export interface UserRoleTable {
  id: Generated<number>;
  userId: number;
  roleId: number;
  createdAt: Generated<Date>;
}

export type NewRole = Insertable<RoleTable>;
export type SelectRole = Selectable<RoleTable>;

export type NewUserRole = Insertable<UserRoleTable>;
export type SelectUserRole = Selectable<UserRoleTable>;
