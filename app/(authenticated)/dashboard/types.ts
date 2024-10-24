import { SelectUser } from "@/db/schemas/userSchema";
import { UserRoles } from "./actions";

export type SessionInfo = {
  id: string;
  expiresAt: Date;
};

export type SessionData = {
  user: SelectUser;
  roles: UserRoles;
  session: SessionInfo;
};
