import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Create the RoleType enum
  await db.schema
    .createType("role_type")
    .asEnum(["admin", "moderator"])
    .execute();

  // Create the role table
  await db.schema
    .createTable("role")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("name", sql`role_type`, (col) => col.notNull().unique())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // Create the user_role junction table
  await db.schema
    .createTable("user_role")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "integer", (col) =>
      col.notNull().references("user.id").onDelete("cascade")
    )
    .addColumn("role_id", "integer", (col) =>
      col.notNull().references("role.id").onDelete("cascade")
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // Create a unique compound index for user_role to prevent duplicate assignments
  await db.schema
    .createIndex("user_role_unique_index")
    .on("user_role")
    .columns(["user_id", "role_id"])
    .unique()
    .execute();

  // Insert default roles
  await db
    .insertInto("role")
    .values([{ name: "admin" }, { name: "moderator" }])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the unique index
  await db.schema.dropIndex("user_role_unique_index").execute();

  // Drop tables
  await db.schema.dropTable("user_role").execute();
  await db.schema.dropTable("role").execute();

  // Drop the enum type
  await db.schema.dropType("role_type").execute();
}
