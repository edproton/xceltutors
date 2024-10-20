import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // First, create the UserType enum
  await db.schema
    .createType("user_type")
    .asEnum(["tutor", "student"])
    .execute();

  // Then, create the user table
  await db.schema
    .createTable("user")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("email", "varchar", (col) => col.notNull().unique())
    .addColumn("first_name", "varchar", (col) => col.notNull())
    .addColumn("last_name", "varchar", (col) => col.notNull())
    .addColumn("password", "varchar")
    .addColumn("type", sql`user_type`)
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("google_id", "varchar")
    .addColumn("discord_id", "varchar")
    .addColumn("picture", "varchar")
    .execute();

  // Create an index on the email column
  await db.schema
    .createIndex("user_email_index")
    .on("user")
    .column("email")
    .execute();

  // Create an index on the google_id column
  await db.schema
    .createIndex("user_google_id_index")
    .on("user")
    .column("google_id")
    .execute();

  // Create an index on the discord_id column
  await db.schema
    .createIndex("user_discord_id_index")
    .on("user")
    .column("discord_id")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the indexes
  await db.schema.dropIndex("user_google_id_index").execute();
  await db.schema.dropIndex("user_discord_id_index").execute();
  await db.schema.dropIndex("user_email_index").execute();

  // Drop the table
  await db.schema.dropTable("user").execute();

  // Drop the enum type
  await db.schema.dropType("user_type").execute();
}
