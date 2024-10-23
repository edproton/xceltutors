"use server";

import { db } from "@/db";
import { userTable } from "@/db/schemas/userSchema";
import { wrapDomainError } from "@/lib/utils/actionUtils";
import { revalidatePath } from "next/cache";
import { getUserBySession } from "../../dashboard/actions";
import { DomainError } from "@/services/domainError";

export const getUsersAction = async () => {
  return wrapDomainError(async () => {
    return db.selectFrom(userTable).selectAll().orderBy("id").execute();
  });
};

export const toggleUserStatusAction = async (
  userId: number,
  status: boolean
) => {
  return wrapDomainError(async () => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const session = await getUserBySession();
    if (session.user.id == userId) {
      throw new DomainError("You can't deactive yourself");
    }

    await db
      .updateTable(userTable)
      .set({ isActive: status })
      .where("id", "=", userId)
      .execute();

    revalidatePath("/users");
  });
};
