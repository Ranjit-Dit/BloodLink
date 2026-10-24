const HttpResponse = require('../constants/response-status.constant');

const send = (res, data, httpStatus = 200, message = 'Success', status = HttpResponse.success) => {
  const isList = Array.isArray(data);
  return res.status(httpStatus).json({
    success: true,
    data,
    message,
    status,
    options: isList ? { total: data.length } : null,
    ...(isList ? { count: data.length } : {}),
  });
};

module.exports = { send };
