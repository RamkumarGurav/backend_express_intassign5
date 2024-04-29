const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
// const cloudinary = require("cloudinary");

const handlerFactory = require("./handlerFactory");

const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const User = require("../models/userModel");
const { SignJWT, jwtVerify } = require("jose");
//--------------------------------------------------------

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey);
// Creating JWT token
async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 week from now")
    .sign(key);
}

async function decrypt(input) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

// Sending jwt token to server via cookies
const createSendToken = async (user, statusCode, req, res) => {
  const userWithoutPass = {
    _id: user._id,
    username: user.username,
    role: user.role,
    status: user.status,
  };
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ data: userWithoutPass, expires });

  //attaching cookie to response object
  res.cookie("session", session, {
    expires,
    httpOnly: true,
    sameSite: false,
    path: "/",
  });

  user.password = undefined; //making password hidden in the output //even though we made selet false for password inside schema ,for signup, password is showing due to Create method

  //sending response
  res.status(statusCode).json({
    //201-created
    success: true,
    session,
    data: user,
  });
};
//--------------------------------------------------------

//----------------REGISTRATION----------------------------------------
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password, role } = req.body;

  const user = await User.create({
    username,
    password,
    role,
  });

  createSendToken(user, 201, req, res);
});
//--------------------------------------------------------

//---------------LOGIN-------------------------------------
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { username, password } = req.body;
  //IMPstep1) we check if email and password exist in the inputted body if they exit then move to step2
  if (!username || !password) {
    return next(new AppError("Pleases provide email and password!", 400)); //400-bad request
  }
  //IMPstep2)checking if user exist by chicking whether given email exists in users collection then if the inputted password is compared with the  userpassword that is stored data base-if both matches then move to step3 and  create token and send it to client
  const user = await User.findOne({ username: username }).select("+password"); ///user document which includes password as a field -because in user model we made select as false for password to not show in output

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    //if there is no user exists in DB or password is incorrect then give error else move to step3
    return next(new AppError("Invalid username or password", 401)); //401-unathorised
  }

  //IMPstep3)if everything is ok then send token to client
  createSendToken(user, 200, req, res);
});
//--------------------------------------------------------

//------------------------PROTECTING ROUTE------------------
//middleware for checking whether given route is protected or not ,if it is protected then control moves to next middleware else it gives an error which is handled by global error handler
//here we check whether route is protected by verifying the jwt token that is provided to user(which is passed in the headers of the request) is same as the jwt token issued to to the user when he is logged in
exports.isRouteProtected = catchAsyncErrors(async (req, res, next) => {
  //IMPstep1)checking the token exits and getting it
  //Checking whether there is a token in the req.headers authorization fields which starts with 'Bearer' word //then get that token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; //jwt token that is sent in headers authorization field
  } else if (req.cookies.session) {
    //if there is jwt in cookie
    token = req.cookies.session;
  }

  if (!token) {
    //if there is no token in the req,  means user is not logged in and error is generated
    return next(
      new AppError("You are not logged in! Please login to get access", 401)
    );
  }

  //IMPstep2)verifing the given token
  //in this -given jwt token is compared with the token that is issued to the loggedin user(original jwt token that is given to the user) -if user is different other than logged in user- it means it contains different payload(ie-different id) then it gives error
  // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //this gives the object that contains id of the user(payload) ,iat:timestamp in seconds when origianl jwt is created and jwt tokens expiration time ,Eg-{ id: '63e062a014de4fc239c6c5ec', iat: 1675649697, exp: 1683425697 }//if there this verification fails then it is catched/handled globalerror handler
  const jwtPayload = await decrypt(token);
  const userData = { ...jwtPayload.data };
  //IMPstep3)check if the user that is mentioned in given jwt token still exists
  const currentUser = await User.findById(userData._id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }

  //IMPstep5) grant access to protected route
  req.user = userData; //storing currentuser in req.user which may be used next middleware in future eg-it is used in restrictedTo middlware to get current user's role
  next(); //if route is protected then move to next middleware which getAllTours
});

//--------------------------------------------------------

//--------------LOGOUT------------------------------------
//whenever user hitts logut route of api we send him a cookie which as same name as 'jwt' which actually stores the jwt token but in this cookie we will store normal text(here-'random text') instead of jwt token when browser reloads and sends this normal text to server then server fails to verify it and login fails and it moves to homepage
exports.logout = (req, res, next) => {
  //attaching cookie to response object
  //here we store normal text(here-'logout') inside the cookie named 'jwt'
  res.cookie("session", "random text", {
    expires: new Date(Date.now() + 1000), //1 seconds lifetime
    secure: false,
    httpOnly: true,
    sameSite: "none",
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};
//--------------------------------------------------------

//------------------------AUTHORIZATION--------------------
//
//middleware function that only allows 'admin' to use given route
exports.restrictTo = (...roles) => {
  //here we return middleware function inside the wrapper funciton because we cant pass arguements(roles) inside middleware funciton //here roles=['admin','user']//by doing this we can use roles inside middleware function
  return catchAsyncErrors(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      //if the current user's role is not included in the  roles array then he is not allowed to move to next middleware-which means if the user is not 'admin' then dont allow the user  to move to next middleware
      return next(
        new AppError("You do not have permission to perform this action", 403) //403-forbidden
      );
    }
    next();
  });
};
//--------------------------------------------------------
