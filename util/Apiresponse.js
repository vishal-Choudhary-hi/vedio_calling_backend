/**
 * Success response wrapper
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message="Success"]
 * @param {number} [statusCode=200]
 */
function SuccessResponse(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
}

/**
 * Error response wrapper
 * @param {import('express').Response} res
 * @param {string} [message="An error occurred"]
 * @param {string} [errorCode="UNKNOWN_ERROR"]
 * @param {number} [statusCode=500]
 */
function ErrorResponse(res, message = "An error occurred", errorCode = "UNKNOWN_ERROR", statusCode = 500) {
  return res.status(statusCode).json({
    status: false,
    message,
    errorCode,
    data: null,
  });
}

module.exports = {
  SuccessResponse,
  ErrorResponse,
};
