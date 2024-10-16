import { Insertable, Selectable } from "kysely";

export const sessionTable = "session";

export interface SessionTable {
  id: string;
  userId: number;
  expiresAt: Date;
}

export type NewSession = Insertable<SessionTable>;
export type SelectSession = Selectable<SessionTable>;
