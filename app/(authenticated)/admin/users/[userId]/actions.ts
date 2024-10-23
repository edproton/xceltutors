"use server";

import { db } from "@/db";
import { roleTable, userRoleTable } from "@/db/schemas/roleSchema";
import { userTable } from "@/db/schemas/userSchema";
import { DomainResponse, wrapDomainError } from "@/lib/utils/actionUtils";
import { DomainError, Errors } from "@/services/domainError";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";
import { UserWithRoles } from "./types";
import { AuthProvider } from "@/services/auth/providers/types";

// Cache tag constants
const CACHE_TAGS = {
  userDetails: (id: number) => `user-${id}`,
  roles: "roles",
} as const;

export async function getUserWithRoles(
  userId: number
): Promise<DomainResponse<UserWithRoles>> {
  return unstable_cache(
    async () => {
      return wrapDomainError(async () => {
        const user = await db
          .selectFrom("user")
          .selectAll()
          .where("id", "=", userId)
          .executeTakeFirst();

        if (!user) {
          throw new DomainError(Errors.User.NotFound);
        }

        const roles = await db
          .selectFrom("role")
          .leftJoin("userRole", (join) =>
            join
              .onRef("userRole.roleId", "=", "role.id")
              .on("userRole.userId", "=", userId)
          )
          .select(["role.id", "role.name"])
          .where("userRole.userId", "=", userId)
          .execute();

        return {
          ...user,
          roles,
        };
      });
    },
    [CACHE_TAGS.userDetails(userId)],
    {
      tags: [CACHE_TAGS.userDetails(userId)],
      revalidate: 30, // Cache for 30 seconds since it's an admin page
    }
  )();
}

export async function getAllRoles() {
  return unstable_cache(
    async () => {
      return wrapDomainError(async () => {
        return db.selectFrom(roleTable).selectAll().execute();
      });
    },
    [CACHE_TAGS.roles],
    {
      tags: [CACHE_TAGS.roles],
      revalidate: 60, // Cache roles for 1 minute
    }
  )();
}

export async function updateUser(
  id: number,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  }
) {
  return wrapDomainError(async () => {
    await db
      .updateTable(userTable)
      .set(data)
      .where("user.id", "=", id)
      .execute();

    revalidatePath("/", "layout");
  });
}

export async function addUserRole(userId: number, roleId: number) {
  return wrapDomainError(async () => {
    await db.insertInto(userRoleTable).values({ userId, roleId }).execute();

    await db
      .selectFrom(roleTable)
      .selectAll()
      .where("id", "=", roleId)
      .executeTakeFirst();

    revalidatePath("/", "layout");
  });
}

export async function removeUserRole(userId: number, roleId: number) {
  return wrapDomainError(async () => {
    await db
      .deleteFrom(userRoleTable)
      .where((eb) =>
        eb.and([
          eb("userRole.userId", "=", userId),
          eb("userRole.roleId", "=", roleId),
        ])
      )
      .execute();

    revalidatePath("/", "layout");
  });
}

export async function unlinkProvider(userId: number, provider: AuthProvider) {
  return wrapDomainError(async () => {
    console.log(`Revoking ${provider} for user ${userId}`);

    revalidatePath("/", "layout");
  });
}
