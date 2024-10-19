"use server";

import { wrapDomainError } from "@/lib/utils/actionUtils";
import { credentialsConfirmEmail } from "@/services/auth/providers/credentials/handler";

export const confirmEmailAction = async (token: string) => {
  return wrapDomainError(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await credentialsConfirmEmail(token);
  });
};
