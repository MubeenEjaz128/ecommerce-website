const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, default: "" },
    },
    link: { type: String, default: "" },
    position: { type: String, default: "home-hero" },
    active: { type: Boolean, default: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Banner", bannerSchema);