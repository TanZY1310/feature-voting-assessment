class ErrorCode:
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    NOT_OPEN = "NOT_OPEN"
    INVALID = "INVALID"
    REDIRECTED_LOCKED = "REDIRECTED_LOCKED"


HTTP_STATUS = {
    ErrorCode.NOT_FOUND: 404,
    ErrorCode.UNAUTHORIZED: 401,
    ErrorCode.FORBIDDEN: 403,
    ErrorCode.NOT_OPEN: 409,
    ErrorCode.INVALID: 400,
    ErrorCode.REDIRECTED_LOCKED: 409,
}


class AppError(Exception):
    def __init__(self, message, code=ErrorCode.INVALID):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status = HTTP_STATUS.get(code, 400)