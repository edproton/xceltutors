"use server";

import { wrapDomainError } from "@/lib/utils/actionUtils";
import { confirmEmail } from "@/services/auth/authService";

export const confirmEmailAction = async (token: string) => {
  return wrapDomainError(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await confirmEmail(token);
  });
};
