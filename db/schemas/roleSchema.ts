import { Generated, Insertable, Selectable } from "kysely";

export const roleTable = "role";
export const userRoleTable = "userRole";

export enum RoleType {
  Admin = "admin",
  Moderator = "moderator",
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
