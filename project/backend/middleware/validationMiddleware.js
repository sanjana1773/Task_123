const { validationResult } = require('express-validator');

// Runs after express-validator rules and short-circuits with a 422 if anything failed.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(422).json({
    message: 'Validation failed',
    errors: errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    })),
  });
};

module.exports = { validate };
