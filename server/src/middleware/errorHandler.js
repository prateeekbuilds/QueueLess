import AppError from '../utils/AppError.js';

/**
 * Map well-known Prisma error codes to user-friendly messages & status codes.
 *
 * @param {import('@prisma/client/runtime/library').PrismaClientKnownRequestError} err
 * @returns {AppError}
 */
const handlePrismaError = (err) => {
  switch (err.code) {
    // Unique constraint violation
    case 'P2002': {
      const fields = err.meta?.target;
      const fieldList = Array.isArray(fields) ? fields.join(', ') : fields;
      return new AppError(
        `A record with this ${fieldList || 'value'} already exists`,
        409,
      );
    }

    // Record not found (e.g. update / delete on missing row)
    case 'P2025': {
      const cause = err.meta?.cause || 'Record not found';
      return new AppError(cause, 404);
    }

    // Foreign key constraint failure
    case 'P2003': {
      const field = err.meta?.field_name || 'related record';
      return new AppError(
        `Invalid reference: the ${field} does not exist`,
        400,
      );
    }

    // Required record not found (e.g. connect)
    case 'P2018':
      return new AppError('Required related record was not found', 404);

    // Value too long for the column
    case 'P2000': {
      const column = err.meta?.column_name || 'field';
      return new AppError(
        `The value for ${column} is too long`,
        400,
      );
    }

    default:
      return new AppError('A database error occurred', 500, false);
  }
};

/**
 * Format a ZodError into a single, human-readable message.
 *
 * @param {import('zod').ZodError} err
 * @returns {AppError}
 */
const handleZodError = (err) => {
  const messages = err.errors.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : 'input';
    return `${path}: ${issue.message}`;
  });

  return new AppError(`Validation failed — ${messages.join('; ')}`, 400);
};

/**
 * Convert a JWT-related error into an AppError.
 *
 * @param {Error} err
 * @returns {AppError}
 */
const handleJwtError = (err) => {
  if (err.name === 'TokenExpiredError') {
    return new AppError('Token has expired. Please log in again', 401);
  }
  // JsonWebTokenError, NotBeforeError, etc.
  return new AppError('Invalid token. Please log in again', 401);
};

// -----------------------------------------------------------------------------
// Global Express error-handling middleware
// -----------------------------------------------------------------------------

/**
 * Express error-handling middleware (4-parameter signature).
 *
 * It normalises every error into a consistent JSON shape:
 * ```json
 * { "success": false, "message": "..." }
 * ```
 *
 * In development mode the response also includes an `error` object with the
 * raw message and stack trace for easier debugging.
 *
 * @param {Error}                          err  - The thrown / forwarded error.
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Default to 500 if nothing else is set
  let error = err;

  // ---- Prisma errors --------------------------------------------------------
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  } else if (err.constructor?.name === 'PrismaClientValidationError') {
    error = new AppError('Invalid data provided to the database query', 400);
  }

  // ---- Zod validation errors ------------------------------------------------
  else if (err.name === 'ZodError') {
    error = handleZodError(err);
  }

  // ---- JWT errors -----------------------------------------------------------
  else if (
    err.name === 'TokenExpiredError' ||
    err.name === 'JsonWebTokenError' ||
    err.name === 'NotBeforeError'
  ) {
    error = handleJwtError(err);
  }

  // ---- Express body-parser / syntax errors ----------------------------------
  else if (err.type === 'entity.parse.failed') {
    error = new AppError('Invalid JSON in request body', 400);
  }

  // ---- Fallback for non-AppError instances ----------------------------------
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'Internal server error',
      error.statusCode || 500,
      false,
    );
  }

  const statusCode = error.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  // Log unexpected (non-operational) errors so they surface in monitoring
  if (!error.isOperational) {
    console.error('💥 Unexpected error:', err);
  }

  const response = {
    success: false,
    message: error.isOperational
      ? error.message
      : 'Something went wrong. Please try again later',
  };

  // In development, attach extra debugging info
  if (isDev) {
    response.error = {
      message: err.message,
      stack: err.stack,
      ...(err.code && { code: err.code }),
    };
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
