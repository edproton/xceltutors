export class DomainError extends Error {
  constructor(public type: string) {
    super(type);
  }
}

export const Errors = {
  User: {
    NotFound: "USER_NOT_FOUND",
    EmailAlreadyExists: "USER_EMAIL_ALREADY_EXISTS",
    AlreadyConfirmed: "USER_ALREADY_CONFIRMED",
    NotConfirmed: "USER_NOT_CONFIRMED",
  },
  Auth: {
    InvalidCredentials: "AUTH_INVALID_CREDENTIALS",
    Unauthorized: "AUTH_UNAUTHORIZED",
    SessionExpired: "AUTH_SESSION_EXPIRED",
    InvalidSession: "AUTH_INVALID_SESSION",
  },
  Data: {
    NotFound: "DATA_NOT_FOUND",
    ValidationFailed: "DATA_VALIDATION_FAILED",
    DuplicateEntry: "DATA_DUPLICATE_ENTRY",
  },
  Server: {
    InternalError: "SERVER_INTERNAL_ERROR",
    DatabaseError: "SERVER_DATABASE_ERROR",
    NetworkError: "SERVER_NETWORK_ERROR",
  },
};
