import { SessionTable } from "./sessionSchema";
import { UserTable } from "./userSchema";

export interface Database {
  user: UserTable;

  session: SessionTable;
}
