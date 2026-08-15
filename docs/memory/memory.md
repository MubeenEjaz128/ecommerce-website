# Discovery & Verification Report (docs/memory/memory.md)

## 1. ORM / Database Layer
- **Actual ORM in use**: **Prisma** (`@prisma/client` v5.22.0) with MySQL database.
- Database client initialized in `server/src/config/db.js` via `const { PrismaClient } = require("@prisma/client")`.
- `prisma.product` is used in `server/src/routes/productRoutes.js` with `buildCrudController`.
- Relation fields (`images` and `variants`) use Prisma relation creation syntax (`{ create: [...] }` on creation, `{ deleteMany: {}, create: [...] }` on update).
- Relation foreign keys (`brandId` and `categoryId`) are correctly extracted and passed as scalar string UUIDs.

## 2. File Path Verification
All specified target files exist and have been updated:
- `client/index.html`
- `client/src/components/navigation/BrandLogo.jsx`
- `client/src/components/home/Hero.jsx`
- `client/src/components/navigation/Footer.jsx`
- `client/src/pages/admin/AdminLayout.jsx`
- `client/src/pages/admin/AdminLoginPage.jsx`
- `client/src/pages/public/AboutPage.jsx`
- `client/src/pages/public/ContactPage.jsx`
- `client/src/pages/public/LoginPage.jsx`
- `client/src/pages/public/RegisterPage.jsx`
- `client/src/pages/public/ShopPage.jsx`
- `client/src/pages/public/CheckoutPage.jsx`
- `client/src/pages/public/PolicyPage.jsx`
- `client/src/components/home/Testimonials.jsx`
- `client/src/components/navigation/CategoryDropdown.jsx`
- `server/src/seed/seed.js`
- `server/src/middlewares/upload.js`
- `server/src/controllers/uploadController.js`
- `server/src/routes/productRoutes.js`
- `server/src/routes/uploadRoutes.js`
- `client/src/pages/admin/ProductEditor.jsx`
- `client/src/components/product/ProductGrid.jsx`
- `client/src/components/product/ProductCard.jsx`

## 3. Storage / Deployment Note
- Local disk uploads are saved in `server/uploads/` with dynamic URL resolving (`${req.protocol}://${req.get("host")}/uploads/...`).
- Note: On ephemeral hosting containers like Render, files saved on local disk do not persist across redeployments. For production persistence across deploys, set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` environment variables.

## 4. Verification Checklist
- [x] Admin product creation payload formatted for Prisma relation creation (`brandId`, `categoryId`, `images`, `variants`).
- [x] Upload middleware updated to accept all common image formats: PNG, JPG, JPEG, WEBP, GIF, SVG, AVIF, BMP, TIFF, HEIC.
- [x] Admin `ProductEditor` allows multi-file image selection with progress and clear error feedback.
- [x] `ProductGrid` lazy loading implemented via `IntersectionObserver` for progressive batch rendering on scroll.
- [x] Hero slider banner badge updated to `Air Covo`.
- [x] Complete brand name update from "Cool Breeze" / "Cooling Shop" to **Air Covo** across all components, titles, footers, meta descriptions, hero slider, and seed files.
