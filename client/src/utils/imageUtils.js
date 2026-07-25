/**
 * Helper utility to optimize image URLs dynamically for Unsplash, Pexels, Cloudinary, and local fallbacks.
 *
 * @param {string} url - Original image URL
 * @param {Object} options - Options object
 * @param {number} [options.width] - Target width in pixels (e.g. 400, 800, 1200)
 * @param {number} [options.height] - Target height in pixels
 * @param {number} [options.quality=75] - Compression quality (1-100)
 * @param {string} [options.format="auto"] - Image format (auto, webp, avif)
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(url, { width, height, quality = 75, format = "auto" } = {}) {
  if (!url || typeof url !== "string") return url;

  // Unsplash URLs
  if (url.includes("images.unsplash.com")) {
    try {
      const parsed = new URL(url);
      if (width) parsed.searchParams.set("w", String(width));
      if (height) parsed.searchParams.set("h", String(height));
      parsed.searchParams.set("q", String(quality));
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    } catch {
      return url;
    }
  }

  // Pexels URLs
  if (url.includes("images.pexels.com")) {
    try {
      const parsed = new URL(url);
      if (width) parsed.searchParams.set("w", String(width));
      if (height) parsed.searchParams.set("h", String(height));
      parsed.searchParams.set("auto", "compress");
      parsed.searchParams.set("cs", "tinysrgb");
      return parsed.toString();
    } catch {
      return url;
    }
  }

  // Cloudinary URLs
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const transforms = [];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    transforms.push(`f_${format}`);
    transforms.push("c_limit");

    const transformString = transforms.join(",");
    return url.replace("/upload/", `/upload/${transformString}/`);
  }

  return url;
}
