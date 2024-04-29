module.exports = function (fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err)); //catching error and sending err to global error handling middleware
  };
};
//this is catchAsync function which returns a anonymous function that gives promise - this is done to separate common catch part of all async tour handler/controller function
  