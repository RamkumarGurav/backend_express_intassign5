const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");

//--------Route iMPORTs------
const userRouter = require("./routes/userRoutes");
const employeeRouter = require("./routes/employeeRoutes");

const app = express();

//---------------------xxx-----------------------------------

//

app.enable("trust proxy");
//In Node.js, app.enable("trust proxy") is used in Express.js to enable trust in the proxy server.
// When your Express.js application is running behind a reverse proxy (like Nginx or Apache) or a load balancer, the client requests pass through the proxy server before reaching your application. The trust proxy setting allows Express.js to trust the proxy server and handle certain headers correctly.
// By calling app.enable("trust proxy"), you are instructing Express.js to enable trust in the proxy server and interpret the headers provided by the proxy correctly. This is important for obtaining the client's IP address and protocol information accurately.
// Once enabled, Express.js will recognize the X-Forwarded-For header, which contains the client's IP address, and the X-Forwarded-Proto header, which indicates the protocol used by the client. Without enabling this setting, Express.js may not correctly identify the client's IP address and protocol.

const corsOptions = {
  //corsOptions in COMA-credentials,origin,methods,allowedHeaders
  credentials: true, //all the credentials like cookies ,sessions are allowed
  origin: true, // for public api //all the domains are allowed to call our api//

  methods: "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE",
  allowedHeaders:
    "Access-Control-Allow-Headers,Access-Control-Allow-Origin, Access-Control-Request-Headers,Access-Control-Request-Method,Accept,Authorization, Content-Type, Origin,  stripe-signature,X-Requested-With",

  // //--------------------------------------------------------
  // origin: [
  //   "https://my-exams-ramkumargurav.vercel.app",
  //   "https://snextjs-h3ruppdy0-ramkumargurav.vercel.app",
  //   "http://localhost:3000",
  // ], // Add your frontend origin here (Don't add '/' at the end).
  // methods: ["GET", "PATCH", "DELETE", "POST", "PUT", "HEAD", "OPTIONS"], //methods that are allowed in cors
  // allowedHeaders: [
  //   //this headers are allowed
  //   "Access-Control-Allow-Headers",
  //   "Origin",
  //   "Accept",
  //   "X-Requested-With",
  //   "Content-Type",
  //   "Access-Control-Request-Method",
  //   "Access-Control-Request-Headers",
  //   "X-CSRF-Token",
  //   "Accept-Version",
  //   "Content-Length",
  //   "Content-MD5",
  //   "Date",
  //   "X-Api-Version",
  //   "Authorization",
  //   "Cookie",
  //   "Access-Control-Allow-Credentials",
  //   "Access-Control-Allow-Methods",
  //   "Access-Control-Allow-Origin",
  // ],
  // //--------------------------------------------------------
};
app.options("*", cors(corsOptions)); // enabling preflight call
app.use("*", cors(corsOptions)); // npm i cors

//--------------------------------------------------------

app.use(cookieParser()); // To parse the incoming cookies

//Body parser middlware
app.use(express.json({ limit: "50mb" })); //middleware for reading data from the body into req.body//here if body contains more than 50mb of data then it will not read
//When a client sends a request with a JSON payload to your Express.js server, the express.json() middleware is responsible for parsing and extracting the JSON data from the request body.
// By using app.use(express.json({ limit: "50mb" })), you are configuring the JSON body parsing middleware to be used for all incoming requests to your Express.js application. Additionally, you are setting a limit of 50 megabytes (50mb) on the size of the JSON payload that can be parsed
// If a request exceeds the specified limit, the server will respond with a 413 Payload Too Large status code. You can handle this response appropriately based on your application's requirements.
// Remember to place the app.use(express.json({ limit: "50mb" })) statement before defining your routes or any other middleware that needs to access the parsed JSON data from the request body.

//this middle helps when we want directly submit our data using form to the url using acton and method -this helps in  parsing submitted data so that value is stored with name of 'name'(of input) property
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// app.use(favicon(__dirname + "/public/images/favicon.ico"));
//--------------------------------------------------------
//
//--------------------------------------------------------
//------------routers--------------------------------
app.get("/", (req, res) => {
  res.send("Welcome to Our API.");
});
app.get("/favicon.ico", (req, res) => res.status(200)); //solving '/favicon.ico' error
app.use("/api/v1", userRouter);
app.use("/api/v1", employeeRouter);

//-----HANDLING UNHANDLED ROUTES---------------------------
app.use("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

//--------GLOBAL ERROR HANDLER----------------------------------
app.use(globalErrorHandler);

module.exports = app;
