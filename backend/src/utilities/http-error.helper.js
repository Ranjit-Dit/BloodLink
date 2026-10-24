const HttpResponse = require('../constants/response-status.constant');

const httpError = (status, message, detail = null) => {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status === 404 ? HttpResponse.notFound
    : status === 409 ? HttpResponse.conflict : HttpResponse.validationFailed;
  error.detail = detail;
  return error;
};

module.exports = { httpError };
