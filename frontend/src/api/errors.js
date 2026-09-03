export const ErrorCode = {
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_OPEN: "NOT_OPEN",
  INVALID: "INVALID",
  REDIRECTED_LOCKED: "REDIRECTED_LOCKED",
}

const HTTP_STATUS = {
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_OPEN]: 409,
  [ErrorCode.INVALID]: 400,
  [ErrorCode.REDIRECTED_LOCKED]: 409,
}

export class ApiError extends Error {
  constructor(message, code = ErrorCode.INVALID) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = HTTP_STATUS[code] ?? 400
  }
}