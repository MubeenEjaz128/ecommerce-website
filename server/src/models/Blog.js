const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    category: { type: String, default: "Style" },
    coverImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    tags: [{ type: String, trim: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true },
);

blogSchema.pre("save", function setSlug(next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  next();
});

module.exports = mongoose.model("Blog", blogSchema);