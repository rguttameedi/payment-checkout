const { validationResult } = require('express-validator');

/**
 * Validation Error Handler Middleware
 * Checks if express-validator found any validation errors
 * Returns 400 with error details if validation failed
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

module.exports = {
  validate
};
