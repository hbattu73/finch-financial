export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export const Errors = {
  unauthorized: (message = 'Unauthorized') =>
    new AppError(ErrorCodes.UNAUTHORIZED, message, 401),
  
  forbidden: (message = 'Forbidden') =>
    new AppError(ErrorCodes.FORBIDDEN, message, 403),
  
  notFound: (resource = 'Resource') =>
    new AppError(ErrorCodes.NOT_FOUND, `${resource} not found`, 404),
  
  badRequest: (message = 'Bad request') =>
    new AppError(ErrorCodes.BAD_REQUEST, message, 400),
  
  internal: (message = 'Internal server error') =>
    new AppError(ErrorCodes.INTERNAL_ERROR, message, 500),
}