import { Pool } from "pg";
import { PostgresDialect } from "kysely";
import { defineConfig } from "kysely-ctl";
import path from "path";
import { env } from "../lib/env";

export default defineConfig({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
    }),
  }),
  migrations: {
    migrationFolder: path.join("db", "migrations"),
  },
  seeds: {
    seedFolder: path.join("db", "seeds"),
  },
});
