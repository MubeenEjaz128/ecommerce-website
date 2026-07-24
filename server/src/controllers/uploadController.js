const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const env = require("../config/env");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function hasRealCloudinary() {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) return false;
  return ![cloudName, apiKey, apiSecret].some((v) => String(v).includes("dummy"));
}

function saveLocalFile(file) {
  const ext = path.extname(file.originalname || "") || ".jpg";
  const publicId = `local_${crypto.randomBytes(12).toString("hex")}`;
  const filename = `${publicId}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, file.buffer);
  const baseUrl = `http://localhost:${env.port}`;
  return {
    url: `${baseUrl}/uploads/${filename}`,
    publicId,
  };
}

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

  // Prefer Cloudinary when real credentials exist; otherwise persist locally so admin images survive refresh
  if (hasRealCloudinary()) {
    try {
      const streamUpload = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: "ecommerce" }, (error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          stream.end(buffer);
        });

      const result = await streamUpload(req.file.buffer);
      return res
        .status(201)
        .json(new ApiResponse(201, "File uploaded", { url: result.secure_url, publicId: result.public_id }));
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local storage:", err?.message || err);
    }
  }

  const local = saveLocalFile(req.file);
  return res.status(201).json(new ApiResponse(201, "File uploaded", local));
});

const deleteFile = asyncHandler(async (req, res) => {
  const publicId = req.params.publicId || req.body.publicId;
  if (!publicId) return res.status(400).json({ success: false, message: "publicId is required" });

  if (String(publicId).startsWith("local_")) {
    const files = fs.readdirSync(uploadsDir).filter((f) => f.startsWith(publicId));
    files.forEach((f) => {
      try {
        fs.unlinkSync(path.join(uploadsDir, f));
      } catch {
        // ignore missing files
      }
    });
    return res.status(200).json(new ApiResponse(200, "File deleted", { publicId }));
  }

  if (hasRealCloudinary()) {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok" && result.result !== "not_found") {
      return res.status(400).json(new ApiResponse(400, "Failed to delete image", result));
    }
  }

  return res.status(200).json(new ApiResponse(200, "File deleted", { publicId }));
});

module.exports = { uploadFile, deleteFile, uploadsDir };
