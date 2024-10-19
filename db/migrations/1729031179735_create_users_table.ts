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
    .addColumn("password", "varchar", (col) => col.notNull())
    .addColumn("type", sql`user_type`)
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .execute();

  // Create an index on the email column
  await db.schema
    .createIndex("user_email_index")
    .on("user")
    .column("email")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the table
  await db.schema.dropTable("user").execute();

  // Drop the index
  await db.schema.dropIndex("user_email_index").execute();

  // Drop the enum type
  await db.schema.dropType("user_type").execute();
}
