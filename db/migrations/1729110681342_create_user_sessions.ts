import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // First, create the ProviderType enum
  await db.schema
    .createType("provider_type")
    .asEnum(["credentials", "google", "discord"])
    .execute();

  await db.schema
    .createTable("session")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.notNull().references("user.id").onDelete("cascade")
    )
    .addColumn("expires_at", sql`timestamptz`, (col) => col.notNull())
    .addColumn("user_agent", "text", (col) => col.notNull())
    .addColumn("ip_address", "text", (col) => col.notNull())
    .addColumn("provider_type", sql`provider_type`, (col) => col.notNull())
    .execute();

  // Create an index on the user_id column
  await db.schema
    .createIndex("session_user_id_index")
    .on("session")
    .column("user_id")
    .execute();

  // Create an index on the ip_address column
  await db.schema
    .createIndex("session_ip_address_index")
    .on("session")
    .column("ip_address")
    .execute();

  // Create an index on the provider_type column
  await db.schema
    .createIndex("session_provider_type_index")
    .on("session")
    .column("provider_type")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the indexes
  await db.schema.dropIndex("session_provider_type_index").execute();
  await db.schema.dropIndex("session_ip_address_index").execute();
  await db.schema.dropIndex("session_user_id_index").execute();

  // Drop the table
  await db.schema.dropTable("session").execute();

  // Drop the enum type
  await db.schema.dropType("provider_type").execute();
}
