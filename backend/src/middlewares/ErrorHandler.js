const { error } = require("../utils/responseFormatter");

module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(err.stack || err);

  return error(res, {
    status,
    message,
  });
};
