// middlewares/upload.js
const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage(); // Use memory storage for Firebase
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Set file size limit to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG, and PNG images are allowed"));
    }
  },
});

module.exports = upload.array("images[]", 10);
