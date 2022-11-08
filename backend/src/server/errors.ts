export class HTTPError extends Error {
  readonly statusCode: HTTPCode

  constructor(statusCode: HTTPCode, message?: string) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this)
  }
}

export const enum HTTPCode {
  OK = 200,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}