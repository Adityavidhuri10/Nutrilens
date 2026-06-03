import ApiError from '../utils/ApiError.js';

/**
 * Request validation middleware factory.
 * Takes a Zod schema and validates the specified request properties.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register);
 *
 * The schema should define validation for 'body', 'params', and/or 'query'.
 */
const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    throw ApiError.badRequest('Validation failed', errors);
  }

  // Replace request data with validated + transformed data
  if (result.data.body !== undefined) req.body = result.data.body;
  if (result.data.params !== undefined) req.params = result.data.params;
  if (result.data.query !== undefined) {
    for (const key in req.query) {
      delete req.query[key];
    }
    Object.assign(req.query, result.data.query);
  }

  next();
};

export default validate;
