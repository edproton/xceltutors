import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { Database } from "./schemas";
import { env } from "../lib/env";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: env.DATABASE_URL,
    max: 10, // Set the maximum number of connections in the pool
  }),
});

export const db = new Kysely<Database>({
  dialect,
  plugins: [new CamelCasePlugin()],
});

export type KyselyDB = typeof db;
