const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const { uploadFile, deleteFile } = require("../controllers/uploadController");

const router = express.Router();

// Admin-only upload (supports single or multiple file uploads)
router.post("/", protect, authorize("admin"), upload.any(), uploadFile);

// Admin-only delete by publicId
router.delete("/:publicId", protect, authorize("admin"), deleteFile);

module.exports = router;
