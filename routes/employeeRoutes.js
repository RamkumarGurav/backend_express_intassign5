const express = require("express");
const employeeController = require("../controllers/employeeController");
const authController = require("../controllers/authController");
const router = express.Router();
const multer = require("multer");
const path = require("path"); // Import the path module
const fs = require("fs");
const mkdirp = require("mkdirp");

function createFolderIfNotExists(path) {
  if (!path.existsSync(path)) {
    fs.mkdirSync(dir, 0o744);
  }
}

//this is catchAsync function which returns a anonymous function that gives promise - this is done to separate common catch part of all async tour handler/controller function

// Multer configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadsPath = "public/uploads/employees";
    cb(null, uploadsPath); // Set upload destination
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // Get file extension
    cb(null, `${file.fieldname}-${Date.now()}${ext}`); // Set unique filename
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(
        new AppError("Only jpg, jpeg, and png image formats are allowed", 400)
      );
    }
    cb(null, true);
  },
}); // Specify field name for single file upload

// GET ALL employeeS
router.get(
  "/employees/authorised",
  authController.isRouteProtected,
  authController.restrictTo("admin"),
  employeeController.getAllEmployees
);

//Creating new Employee
router.post(
  "/employees/authorised",
  authController.isRouteProtected,
  authController.restrictTo("admin"),
  upload.single("image"),
  employeeController.createEmployee
);

//upadte and delete employee
router
  .route("/employees/authorised/:id")
  .get(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    employeeController.getSingleEmployee
  )
  .patch(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    upload.single("image"),
    employeeController.updateEmployee
  )
  .delete(
    authController.isRouteProtected,
    authController.restrictTo("admin"),
    employeeController.deleteEmployee
  );

router.route("/employees/delete-image").get(employeeController.deleteImage);

module.exports = router;
