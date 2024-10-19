import { DomainError, Errors } from "@/services/domainError";

export const wrapDomainError = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof DomainError) {
      throw new Error(error.type);
    }

    throw new Error(Errors.Server.InternalError);
  }
};
