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
    InvalidToken: "AUTH_INVALID_TOKEN",
    TokenExpired: "AUTH_TOKEN_EXPIRED",
    InvalidCredentials: "AUTH_INVALID_CREDENTIALS",
    Unauthorized: "AUTH_UNAUTHORIZED",
    Unauthenticated: "AUTH_UNAUTHENTICATED",
    SessionExpired: "AUTH_SESSION_EXPIRED",
    InvalidSession: "AUTH_INVALID_SESSION",
    InvalidOAuthFlow: "AUTH_OAUTH_INVALID_FLOW",
    InvalidOAuthState: "AUTH_OAUTH_INVALID_STATE",
    InvalidOAuthCode: "AUTH_OAUTH_INVALID_CODE",
    ProviderCredentialsAlreadyExists:
      "AUTH_PROVIDER_CREDENTIALS_ALREADY_EXISTS",
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
