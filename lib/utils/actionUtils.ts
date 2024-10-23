import { DomainError, Errors } from "@/services/domainError";

export type ErrorValues = typeof Errors extends Record<
  string,
  Record<string, infer V>
>
  ? V
  : never;

export type DomainSuccessResponse<T> = {
  status: true;
  isSuccess: true;
  isError: false;
  data: T;
  error: null;
};

export type DomainErrorResponse = {
  status: false;
  isSuccess: false;
  isError: true;
  data: null;
  error: ErrorValues;
};

export type DomainResponse<T> = DomainSuccessResponse<T> | DomainErrorResponse;

export const wrapDomainError = async <T>(
  fn: () => Promise<T>
): Promise<DomainResponse<T>> => {
  try {
    const data = await fn();
    return {
      status: true,
      isSuccess: true,
      isError: false,
      data,
      error: null,
    } as const satisfies DomainSuccessResponse<T>;
  } catch (error) {
    console.error(error);
    return {
      status: false,
      isSuccess: false,
      isError: true,
      data: null,
      error:
        error instanceof DomainError
          ? (error.type as ErrorValues)
          : Errors.Server.InternalError,
    } as const satisfies DomainErrorResponse;
  }
};
