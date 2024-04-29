const handlerFactory = require("./handlerFactory");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/APIFeatures");
const Employee = require("../models/empModel");
const fs = require("fs");
const multer = require("multer");
//--------------------------------------------------------

//-------------Get All Procuts--------------------------------
exports.getAllEmployees = catchAsyncErrors(async (req, res, next) => {
  const resultsPerPage = req.query.limit; //for pagination
  const employeesCount = await Employee.countDocuments(); //total no. of employees without any queries

  let features = new APIFeatures(Employee.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields();

  // const doc = await features.query.explain();//used for creating indexes
  let employees = await features.query;
  let filteredEmployeesCount = employees.length; //total no. of employees after queries before pagination because we need to know how many total employees are found before dividing them into pages
  features = new APIFeatures(Employee.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(resultsPerPage);

  employees = await features.query;
  const results = employees.length;

  //SENDING RESPONSE
  res.status(200).json({
    success: true,
    count: results,
    data: employees,
  });
});
//--------------------------------------------------------

//------------Get single Employee---------------------------------
exports.getSingleEmployee = catchAsyncErrors(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No employee found with that ID ", 404));
  }

  res.status(200).json({
    success: true,
    results: employee.length,
    data: employee,
  });
});
//--------------------------------------------------------

//------------ADMINS ONLY---------------------------------

//------------Create a Employee-------------------------------
exports.createEmployee = catchAsyncErrors(async (req, res, next) => {
  const { name, email, mobile, gender, designation, courses } = req.body;
  const employeeData = {
    name,
    email,
    mobile,
    gender,
    designation,
    courses: courses ? JSON.parse(courses) : [],
    image: req.file.filename,
  };
  console.log(employeeData);
  const existingEmp = await Employee.findOne({
    email: employeeData.email,
  });

  if (existingEmp) {
    //throwing error if similar wrong id is search in url
    return next(new AppError("Employee with this email already exists ", 404));
  }

  // Create new Employee instance
  const employee = new Employee({ ...employeeData });
  const newEmployee = await employee.save(); // Save new employee to the database

  res.status(201).json({
    //201-created
    success: true,
    data: newEmployee,
  });
});

//--------------------------------------------------------

//------------Update a Employee--------------------------------------
exports.updateEmployee = catchAsyncErrors(async (req, res, next) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No employee found with that ID ", 404));
  }
  const { name, email, mobile, gender, designation, courses, imageName } =
    req.body;
  const employeeData = {
    name,
    email,
    mobile,
    gender,
    designation,
    courses: courses ? JSON.parse(courses) : [],
    image: imageName ? imageName : req.file.filename,
  };

  if (imageName) {
    fs.unlink(`public/uploads/employees/${emp.image}`, (err) => {
      if (err) {
        console.error(err);
      }

      console.log("File removed");
    });
  }

  const updateEmp = await Employee.findByIdAndUpdate(
    req.params.id,
    employeeData,
    {
      new: true, //it returns modified document rather than original
      runValidators: true, //running validators again during update(because builtin validators only run automatically for create method)
    }
  );

  if (!updateEmp) {
    //throwing error if similar wrong id is search in url
    return next(new AppError("No employee found with that ID ", 404));
  }

  res.status(200).json({
    success: true,
    data: updateEmp,
  });
});
//--------------------------------------------------------

//-------------Delete a Employee----------------------------
exports.deleteEmployee = catchAsyncErrors(async (req, res, next) => {
  let employee = await Employee.findById(req.params.id);

  if (!employee) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No employee found with that ID ", 404));
  }

  fs.unlink(`public/uploads/employees/${employee.image}`, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("File removed");
    }
  });

  employee = await Employee.findByIdAndDelete(req.params.id);

  if (!employee) {
    //throwing error if similar wrong id is searched in url
    return next(new AppError("No employee found with that ID ", 404));
  }

  res.status(204).json({
    //204-no Data
    success: true,
    data: null,
  });
});
//--------------------------------------------------------

exports.deleteImage = catchAsyncErrors(async (req, res, next) => {
  console.log("I am deleteImage");
  fs.unlink(`public/uploads/employees/image-1714330911467.jpg`, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("File removed");
    }
  });

  res.status(204).json({
    //204-no Data
    success: true,
    data: null,
  });
});
