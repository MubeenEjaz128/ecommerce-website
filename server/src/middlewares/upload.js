const multer = require("multer");
const ApiError = require("../utils/ApiError");

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
    return cb(new ApiError(400, "Only image and video uploads are allowed"), false);
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

module.exports = upload;