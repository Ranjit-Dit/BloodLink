const HttpResponse = require('../constants/response-status.constant');

const notFound = (_req, _res, next) => {
  next({ status: 404, message: 'Route not found.', statusCode: HttpResponse.notFound });
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.status || 500;
  let message = error.message || 'Internal server error.';
  let status = error.statusCode || HttpResponse.internalServerError;
  let detail = error.detail || null;

  if (error.code === 11000) {
    statusCode = 409;
    status = HttpResponse.conflict;
    message = 'A donor with this phone number already exists.';
    detail = { phone: message };
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    status = HttpResponse.validationFailed;
    message = 'Validation failed.';
    detail = Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]));
  } else if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    status = HttpResponse.validationFailed;
    message = 'Invalid JSON body.';
  } else if (error.type === 'entity.too.large') {
    statusCode = 413;
    status = HttpResponse.validationFailed;
    message = 'Request body is too large. Maximum size is 16 KB.';
  } else if (statusCode >= 500) {
    console.error(error.message);
    message = 'Internal server error.';
  }
  return res.status(statusCode).json({ success: false, data: detail, message, status, options: null, ...(detail ? { detail } : {}) });
};

module.exports = { notFound, errorHandler };
