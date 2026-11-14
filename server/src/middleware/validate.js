import AppError from '../utils/AppError.js';

/**
 * Express middleware factory that validates `req.body` against a Zod schema.
 *
 * On success the parsed (and potentially transformed) data replaces `req.body`
 * so downstream handlers always receive clean, typed input.
 *
 * On failure a formatted 400 error is forwarded to the global error handler
 * via `next()`.
 *
 * @param {import('zod').ZodSchema} schema - Any Zod schema (z.object, z.array, …).
 * @returns {import('express').RequestHandler}
 *
 * @example
 * import { z } from 'zod';
 * import { validate } from '../middleware/validate.js';
 *
 * const createUserSchema = z.object({
 *   name:  z.string().min(1),
 *   email: z.string().email(),
 * });
 *
 * router.post('/users', validate(createUserSchema), createUser);
 */
export const validate = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const messages = result.error.errors.map((issue) => {
        const path = issue.path.length ? issue.path.join('.') : 'input';
        return `${path}: ${issue.message}`;
      });

      return next(
        new AppError(`Validation failed — ${messages.join('; ')}`, 400),
      );
    }

    // Replace body with the parsed & transformed data
    req.body = result.data;
    next();
  };
};

export default validate;
