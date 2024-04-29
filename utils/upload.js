// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = "public/uploads/employees";
    createFolderIfNotExists(uploadsPath); // Ensure target folder exists
    cb(null, uploadsPath); // Set upload destination
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // Get file extension
    cb(null, `${file.fieldname}-${Date.now()}${ext}`); // Set unique filename
  },
});

export const upload = multer({
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
