/**
 * Shared helper / utility functions used across the QueueLess codebase.
 */

/**
 * Return a shallow copy of `obj` with the listed `fields` removed.
 *
 * The original object is never mutated.
 *
 * @param {Record<string, unknown>} obj    - Source object.
 * @param {string[]}                fields - Keys to strip.
 * @returns {Record<string, unknown>} A new object without the excluded fields.
 *
 * @example
 * excludeFields({ a: 1, b: 2, c: 3 }, ['b', 'c']);
 * // => { a: 1 }
 */
export const excludeFields = (obj, fields) => {
  if (!obj || typeof obj !== 'object') return obj;

  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !fields.includes(key)),
  );
};

/**
 * Convenience wrapper that strips `passwordHash` (and optionally other
 * sensitive fields) from a User object before it leaves the server.
 *
 * @param {Record<string, unknown>} user - A raw user record from Prisma.
 * @returns {Record<string, unknown>} Sanitised user object.
 */
export const formatUser = (user) => {
  if (!user) return user;
  return excludeFields(user, ['passwordHash']);
};

/**
 * Convert human-friendly `page` / `limit` values into Prisma-compatible
 * `skip` and `take` parameters.
 *
 * Both inputs are clamped to safe ranges:
 * - `page`  → minimum 1
 * - `limit` → 1 … 100 (default 10)
 *
 * @param {number|string} [page=1]  - 1-based page number.
 * @param {number|string} [limit=10] - Items per page.
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 *
 * @example
 * paginate(2, 20);
 * // => { skip: 20, take: 20, page: 2, limit: 20 }
 */
export const paginate = (page = 1, limit = 10) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  return {
    skip: (parsedPage - 1) * parsedLimit,
    take: parsedLimit,
    page: parsedPage,
    limit: parsedLimit,
  };
};
