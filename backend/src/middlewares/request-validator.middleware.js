const { httpError } = require('../utilities/http-error.helper');

const validate = (schemaDto, source) => (req, _res, next) => {
  try {
    const input = req[source];
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw httpError(400, source === 'body' ? 'Send a JSON object with Content-Type: application/json.' : 'Invalid query parameters.');
    }
    const dangerousKeys = Object.keys(input).filter(key => ['__proto__', 'constructor', 'prototype'].includes(key));
    if (dangerousKeys.length) throw httpError(400, `Unknown fields: ${dangerousKeys.join(', ')}.`);
    const { value, error } = schemaDto.validate(input, {
      abortEarly: false, convert: false, allowUnknown: false, stripUnknown: false,
    });
    if (error) {
      const detail = {};
      for (const issue of error.details) detail[issue.path.join('.') || source] = issue.message;
      throw httpError(400, 'Validation failed.', detail);
    }
    req[source] = value;
    next();
  } catch (exception) {
    next(exception);
  }
};

const bodyValidator = schemaDto => validate(schemaDto, 'body');
const queryValidator = schemaDto => validate(schemaDto, 'query');

module.exports = { bodyValidator, queryValidator };
