/* eslint-disable import/no-useless-path-segments */
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("./../utils/AppError");
const APIFeatures = require("./../utils/APIFeatures");
//--------------------------------------------------------

//--------------------------------------------------------
exports.deleteOne = function (Model) {
  //a function which has arguement Model return another function with arguements req,res,next so return funcion can access all 4 arguements Model,req,res,next
  return catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      //throwing error if similar wrong id is searched in url
      return next(new AppError("No document found with that ID ", 404));
    }

    res.status(204).json({
      //204-no Data
      status: "success",
      data: null,
    });
  });
};
//--------------------------------------------------------

//--------------------------------------------------------

exports.updateOne = function (Model) {
  return catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //it returns modified document rather than original
      runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
    });

    if (!doc) {
      //throwing error if similar wrong id is search in url
      return next(new AppError("No document found with that ID ", 404));
    }

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });
};
//--------------------------------------------------------

//--------------------------------------------------------
// createOne is Not recommended for Security reasons
exports.createOne = function (Model) {
  return catchAsyncErrors(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      //201-created
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });
};
//--------------------------------------------------------

//--------------------------------------------------------
exports.getOne = function (Model, populateOptions) {
  return catchAsyncErrors(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;

    if (!doc) {
      //throwing error if similar wrong id is searched in url
      return next(new AppError("No document found with that ID ", 404));
    }

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });
};
//--------------------------------------------------------

//--------------------------------------------------------
exports.getAll = function (Model) {
  return catchAsyncErrors(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    //SENDING RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });
};
