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
  req.body = result.data.body ?? req.body;
  req.params = result.data.params ?? req.params;
  req.query = result.data.query ?? req.query;

  next();
};

export default validate;
