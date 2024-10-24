import { Kysely } from "kysely";
import * as argon2 from "argon2";

export async function seed(db: Kysely<any>): Promise<void> {
  const ROOT_EMAIL = "root@xceltutors.com";
  const ROOT_PASSWORD = "xcel2024!@#"; // Change this password in production

  // Check if root user already exists to avoid duplicates
  const existingUser = await db
    .selectFrom("user")
    .select("id")
    .where("email", "=", ROOT_EMAIL)
    .executeTakeFirst();

  if (existingUser) {
    console.log("Root user already exists, skipping creation");
    return;
  }

  // Hash the password
  const hashedPassword = await argon2.hash(ROOT_PASSWORD);

  // Begin a transaction
  await db.transaction().execute(async (trx) => {
    // 1. Create the user
    const [user] = await trx
      .insertInto("user")
      .values({
        email: ROOT_EMAIL,
        first_name: "Root",
        last_name: "Admin",
        password: hashedPassword,
        type: "tutor",
        is_active: true,
        picture: null,
        google_id: null,
        discord_id: null,
      })
      .returning("id")
      .execute();

    console.log("Created root user with ID:", user.id);

    // 2. Get the admin role ID
    const adminRole = await trx
      .selectFrom("role")
      .select("id")
      .where("name", "=", "admin")
      .executeTakeFirst();

    if (!adminRole) {
      throw new Error("Admin role not found in the database");
    }

    // 3. Assign the admin role to the user
    await trx
      .insertInto("user_role")
      .values({
        user_id: user.id,
        role_id: adminRole.id,
      })
      .execute();

    console.log("Assigned admin role to root user");
  });
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove the root user and its role assignments will be cascade deleted
  await db
    .deleteFrom("user")
    .where("email", "=", "root@xceltutors.com")
    .execute();

  console.log("Removed root user");
}
