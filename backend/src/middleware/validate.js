// Replaces req.body with the parsed (trimmed, coerced) data, or throws a ZodError -> 400.
export const validate = (schema) => (req, _res, next) => {
  req.body = schema.parse(req.body ?? {});
  next();
};
