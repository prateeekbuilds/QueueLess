/**
 * Custom application error class.
 *
 * Operational errors (e.g. bad user input, missing resource) are marked with
 * `isOperational = true` so the global error handler can distinguish them from
 * unexpected programmer errors and respond appropriately.
 */
class AppError extends Error {
  /**
   * @param {string}  message    - Human-readable error description.
   * @param {number}  statusCode - HTTP status code (default 500).
   * @param {boolean} isOperational - Whether the error is an expected operational error.
   */
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture a clean stack trace, excluding the constructor frame.
    Error.captureStackTrace(this, this.constructor);
  }

  // ---------------------------------------------------------------------------
  // Static factory methods
  // ---------------------------------------------------------------------------

  /**
   * 400 Bad Request
   * @param {string} [message='Bad request']
   * @returns {AppError}
   */
  static badRequest(message = 'Bad request') {
    return new AppError(message, 400);
  }

  /**
   * 401 Unauthorized
   * @param {string} [message='Unauthorized']
   * @returns {AppError}
   */
  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  /**
   * 403 Forbidden
   * @param {string} [message='Forbidden']
   * @returns {AppError}
   */
  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  /**
   * 404 Not Found
   * @param {string} [message='Resource not found']
   * @returns {AppError}
   */
  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  /**
   * 409 Conflict
   * @param {string} [message='Resource already exists']
   * @returns {AppError}
   */
  static conflict(message = 'Resource already exists') {
    return new AppError(message, 409);
  }
}

export default AppError;
