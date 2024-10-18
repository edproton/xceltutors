"use server";

import { confirmEmail } from "@/services/auth/authService";
import { DomainError, Errors } from "@/services/domainError";

const wrapDomainError = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof DomainError) {
      // Convert DomainError to a regular Error with the appropriate message
      throw new Error(error.type);
    }

    // For unknown errors, throw a generic internal error
    throw new Error(Errors.Server.InternalError);
  }
};

export const confirmEmailAction = async (token: string) => {
  return wrapDomainError(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await confirmEmail(token);
  });
};
