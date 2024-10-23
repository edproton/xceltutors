import { RoleTable, UserRoleTable } from "./roleSchema";
import { SessionTable } from "./sessionSchema";
import { UserTable } from "./userSchema";

export interface Database {
  user: UserTable;
  role: RoleTable;
  userRole: UserRoleTable;
  session: SessionTable;
}
