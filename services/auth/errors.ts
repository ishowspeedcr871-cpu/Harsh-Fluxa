export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function isAuthError(error: unknown) {
  return error instanceof AuthenticationError || error instanceof AuthorizationError;
}

export function authErrorStatus(error: unknown) {
  if (error instanceof AuthenticationError) return 401;
  if (error instanceof AuthorizationError) return 403;
  return 500;
}

export function authErrorCode(error: unknown) {
  if (error instanceof AuthenticationError) return "UNAUTHENTICATED";
  if (error instanceof AuthorizationError) return "FORBIDDEN";
  return "INTERNAL_SERVER_ERROR";
}
