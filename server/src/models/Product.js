const mongoose = require("mongoose");
const slugify = require("slugify");

const productVariantSchema = new mongoose.Schema(
  {
    size: { type: String, trim: true, default: "" },
    color: { type: String, trim: true, default: "" },
    sku: { type: String, trim: true, required: true },
    stock: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: "" },
        alt: { type: String, default: "" },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    videoUrl: { type: String, default: "" },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    sizes: [{ type: String, trim: true }],
    colors: [{ type: String, trim: true }],
    variants: [productVariantSchema],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, default: 0, min: 0 },
    tags: [{ type: String, trim: true }],
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", tags: "text" });

productSchema.pre("save", function setSlug(next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Ensure only one primary image
  if (Array.isArray(this.images) && this.images.length) {
    const hasPrimary = this.images.some((img) => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    } else {
      // normalize: make sure only first primary remains primary
      let firstPrimaryFound = false;
      this.images = this.images.map((img) => {
        if (img.isPrimary && !firstPrimaryFound) {
          firstPrimaryFound = true;
          return img;
        }
        return { ...img, isPrimary: false };
      });
    }
  }

  next();
});

productSchema.virtual("effectivePrice").get(function effectivePrice() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return this.price - (this.price * this.discount) / 100;
  }

  if (this.discount > 0) {
    return this.price - (this.price * this.discount) / 100;
  }

  return this.price;
});

module.exports = mongoose.model("Product", productSchema);