class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //calling Parent Error which only takes message as arguement
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; //creating status based on statusCode -if statusCode starts with 4 (ie all 400 codes) then status is 'fail' otherwise its 'error'
    this.isOperational = true; //adding 'isOperational' field true to all err objects that are created using this class - so that in future we can identify which are operational errors and which are programming errors(errors done by programmers during writing code)//for all operational errors this class is used to create error objects

    Error.captureStackTrace(this, this.constructor); //adding error stacktrace to error objects
  }
}

module.exports = AppError;
