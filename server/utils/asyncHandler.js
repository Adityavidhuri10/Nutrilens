/**
 * Wraps async route handlers to catch errors and forward them to Express error middleware.
 * Eliminates try/catch boilerplate in every controller method.
 *
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
