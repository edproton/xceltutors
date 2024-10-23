"use server";

import { db } from "@/db";
import { userTable } from "@/db/schemas/userSchema";
import { wrapDomainError } from "@/lib/utils/actionUtils";
import { revalidatePath } from "next/cache";
import { DomainError } from "@/services/domainError";

export const getUsersAction = async () => {
  return wrapDomainError(async () => {
    return db.selectFrom(userTable).selectAll().orderBy("id").execute();
  });
};

export const toggleUserStatusAction = async (
  currentUserId: number,
  targetUserId: number,
  status: boolean
) => {
  return wrapDomainError(async () => {
    if (!targetUserId) {
      throw new Error("User ID is required");
    }

    if (currentUserId == targetUserId) {
      throw new DomainError("You can't deactive yourself");
    }

    await db
      .updateTable(userTable)
      .set({ isActive: status })
      .where("id", "=", targetUserId)
      .execute();

    revalidatePath("/users");
  });
};
