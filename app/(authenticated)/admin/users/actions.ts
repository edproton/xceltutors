"use server";

import { db } from "@/db";
import { userTable } from "@/db/schemas/userSchema";
import { wrapDomainError } from "@/lib/utils/actionUtils";

export const getUsersAction = async () => {
  return wrapDomainError(async () => {
    return db.selectFrom(userTable).selectAll().orderBy("id").execute();
  });
};
