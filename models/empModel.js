const mongoose = require("mongoose");

const Designation = {
  HR: "HR",
  SALES: "Sales",
  MANAGER: "Manager",
};

const Gender = {
  MALE: "Male",
  FEMALE: "Female",
};

/* =======================================================================
          USERSCHEMA
   ======================================================================= */
const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxlength: [50, "name must contain less than 50 characters"],
      minlength: [2, "name must contain more than 2 characters"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          // Regular expression for email validation
          return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            value
          );
        },
        message: "Please enter a valid email address",
      },
    },
    mobile: {
      type: String,
      required: [true, "Please enter your mobile number"],
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value); // Validate that mobile number is exactly 10 digits
        },
        message: "Mobile number must be a 10-digit numeric value",
      },
    },
    designation: {
      type: String,
      enum: Object.values(Designation), // Ensure role is one of the enum values
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender), // Ensure role is one of the enum values
      required: true,
    },
    courses: {
      type: [String],
      required: true,
      validate: {
        validator: function (courses) {
          // Ensure the courses array contains at least one element
          return courses.length > 0;
        },
        message: "At least one course is required",
      },
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
