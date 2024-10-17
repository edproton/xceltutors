import { Insertable, Selectable } from "kysely";

export const sessionTable = "session";

export interface SessionTable {
  id: string;
  userId: number;
  expiresAt: Date;
  userAgent: string;
  ipAddress: string;
}

export type NewSession = Insertable<SessionTable>;
export type SelectSession = Selectable<SessionTable>;
