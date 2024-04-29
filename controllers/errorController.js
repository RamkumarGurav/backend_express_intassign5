const AppError = require("../utils/AppError");

const sendErrorDev = (err, req, res) => {
  //key - development error is a MESS-Message,Error,Status,Stack
  console.error("ERROR 🔥", err);
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
//--------------------------------------------------------

//--------------------------------------------------------
const sendErrorProd = (err, req, res) => {
  //production error only needs status and message
  if (err.isOperational) {
    console.error("ERROR 🔥", err);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    console.error("ERROR 🔥", err);
    res.status(500).json({
      success: false,
      message: "Something went very wrong",
    });
  }
};
//--------------------------------------------------------

//---------------------------------------------------------
// Creating Production Error messages
//Cast Error -In Node.js with MongoDB, a "CastError" is an error that occurs when there is a data type mismatch or an invalid value is passed to a MongoDB query or operation. It typically happens when the value provided for a specific field does not match the expected data type defined in the MongoDB schema.
const handleCastErrorDb = (err) => {
  const message = `Resource not Found.Invalid ${err.path}:${err.value}`; //'Resource not Found. Invalid _id:xxxxxadf
  return new AppError(message, 400); //400- bad request
};

// //--------------------------------------------------------
const handleDuplicateFieldsErrorDb = (err) => {
  const value = err.message.match(/{([^}]+})/g); //finding value of entered field which is between { } in errmsg
  const message = `Duplicate field value:${value} Please use another value!`; //eg-"Duplicate field value:\"email:user5@gmail.com\" Please use another value!"
  return new AppError(message, 400); //400- bad request
};

// //--------------------------------------------------------
const handleValidationErrorDb = (err) => {
  // const values = err.message;
  const errorMsgsStr = Object.values(err.errors)
    .map((el) => el.message)
    .join(". ");
  const message = `Invalid input Data. ${errorMsgsStr}`;
  return new AppError(message, 400); //400- bad request
};

//--------------------------------------------------------
const handleJWTError = () => {
  return new AppError("Invalid JWT token.Please login again", 401); //401-unauthorized
};

//--------------------------------------------------------

//--------------------------------------------------------
const handleJWTExpiredError = () => {
  return new AppError(
    "Your JWT token has been expired.Please login again",
    401
  ); //401 - unauthorized
};

//--------------------------------------------------------

//--------------------------------------------------------

//------------GLOBAL ERROR HANDLER--------------------------------------------

module.exports = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    let prodError = { ...err };
    prodError.message = err.message;
    //5 types of errors
    //--------------------------------------------------------
    if (err.name === "CastError") {
      // the error message means that it can't create an ObjectID from your request body//http://localhost:5000/api/v1/products/xxxxx9b2ee47---//here 'xxxxx9b2ee47' supposed to be a mongodb ID but its not an id that follows mongodb id structure/styntax  thats why mongodb gives castError
      prodError = handleCastErrorDb(err);
    }
    //--------------------------------------------------------
    // for Mango errors where a alredy existing field (eg-name or email) is  entered again -duplicate key error
    if (err.code === 11000) {
      prodError = handleDuplicateFieldsErrorDb(err);
    }
    //--------------------------------------------------------
    // //for ValidationErrors where validation conditions are not met like giving 6 as ratingsAverage
    if (err.name === "ValidationError") {
      prodError = handleValidationErrorDb(err);
    }
    //--------------------------------------------------------
    if (err.name === "JsonWebTokenError") {
      //error if token has differen payload (id)
      prodError = handleJWTError(err);
    }
    //--------------------------------------------------------
    if (err.name === "TokenExpiredError") {
      //error if token is expired
      prodError = handleJWTExpiredError(err);
    }
    //--------------------------------------------------------

    sendErrorProd(prodError, req, res);
  }
};
