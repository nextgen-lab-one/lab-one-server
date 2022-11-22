const ErrorObject = require("../utils/error");
const { NODE_ENV } = process.env;

const handleCastError = (err) => {
  let message = `The ${err.path} does not contain ${err.value}`;
  return new ErrorObject(message, 400);
};

const handleWebTokenError = (err) => new ErrorObject(err.message, 401);

const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};

const prodError = (err, res) => {
  res.status(err.statusCode ? err.statusCode : 500).json({
    status: err.status ? err.status : "error",
    message: err.message ? err.message : "something is wrong",
  });
};

const ErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (NODE_ENV === "development") {
    devError(err, res);
  } else {
    let error = { ...err };
    if (error.name === "CastError") error = handleCastError(error);
    if (error.name === "JsonWebTokenError") error = handleWebTokenError(error);
    prodError(err, res);
  }
  next();
};

module.exports = ErrorHandler;
