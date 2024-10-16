import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("session")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.notNull().references("user.id").onDelete("cascade")
    )
    .addColumn("expires_at", sql`timestamptz`, (col) => col.notNull())
    .execute();

  // Create an index on the user_id column
  await db.schema
    .createIndex("session_user_id_index")
    .on("session")
    .column("user_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the index
  await db.schema.dropIndex("session_user_id_index").execute();

  // Drop the table
  await db.schema.dropTable("session").execute();
}
