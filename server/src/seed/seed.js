const slugify = require("slugify");
const { prisma } = require("../config/db");
const bcrypt = require("bcryptjs");

const categories = ["Split ACs", "Window ACs", "Portable ACs", "Inverter ACs", "Air Coolers", "Fans", "Sale"].map(
  (name) => ({
    name,
    slug: slugify(name, { lower: true, strict: true }),
  }),
);

const brands = ["Daikin", "LG", "Samsung", "Carrier", "Voltas", "Blue Star", "Panasonic", "Hitachi"].map(
  (name) => ({
    name,
    slug: slugify(name, { lower: true, strict: true }),
  }),
);

const acImages = [
  "https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/7031606/pexels-photo-7031606.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/5824903/pexels-photo-5824903.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/4050318/pexels-photo-4050318.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
];

const productTemplates = [
  { label: "1.5 Ton Split AC", tonnage: "1.5 Ton", energy: "5 Star", coverage: "150–180 sq ft", base: 620 },
  { label: "1 Ton Inverter Split", tonnage: "1.0 Ton", energy: "5 Star", coverage: "100–120 sq ft", base: 540 },
  { label: "2 Ton Window AC", tonnage: "2.0 Ton", energy: "3 Star", coverage: "180–220 sq ft", base: 480 },
  { label: "Portable AC 14000 BTU", tonnage: "14000 BTU", energy: "4 Star", coverage: "350–450 sq ft", base: 399 },
  { label: "Desert Air Cooler", tonnage: "N/A", energy: "Energy Efficient", coverage: "Large room", base: 189 },
  { label: "Tower Fan with Remote", tonnage: "N/A", energy: "Low Power", coverage: "Bedroom / office", base: 79 },
];

async function seedDatabase() {
  await prisma.product.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const customerPassword = await bcrypt.hash("Customer123!", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
      isVerified: true,
      avatarUrl: "https://ui-avatars.com/api/?name=Cool+Breeze+Admin",
    }
  });

  const customer = await prisma.user.create({
    data: {
      name: "Jane Customer",
      email: "jane@example.com",
      password: customerPassword,
      role: "customer",
      isVerified: true,
      avatarUrl: "https://ui-avatars.com/api/?name=Jane+Customer",
    }
  });

  const createdCategories = [];
  for (const c of categories) {
    createdCategories.push(await prisma.category.create({ data: c }));
  }

  const createdBrands = [];
  for (const b of brands) {
    createdBrands.push(await prisma.brand.create({ data: b }));
  }

  const productSeed = Array.from({ length: 24 }, (_item, index) => {
    const template = productTemplates[index % productTemplates.length];
    const category = createdCategories[index % (createdCategories.length - 1)];
    const brand = createdBrands[index % createdBrands.length];
    const price = template.base + index * 15;
    const name = `${brand.name} ${template.label} ${index + 1}`;

    return {
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description: `${brand.name} ${template.label} with ${template.tonnage} capacity, ${template.energy} energy rating, ideal for ${template.coverage}. Quiet operation and reliable cooling from Cool Breeze.`,
      shortDescription: `${template.tonnage} · ${template.energy} · ${template.coverage}`,
      brandId: brand.id,
      categoryId: category.id,
      images: {
        create: [
          {
            url: acImages[index % acImages.length],
            alt: name,
            isPrimary: true,
          }
        ]
      },
      specifications: {
        tonnage: template.tonnage,
        energyRating: template.energy,
        coverage: template.coverage,
      },
      colors: ["White", "Silver"],
      variants: {
        create: [
          {
            size: template.tonnage,
            color: "White",
            sku: `CB-${index + 1}-W`,
            stock: 20 + index,
            price,
          }
        ]
      },
      price,
      compareAtPrice: price + 80,
      discount: index % 4 === 0 ? 10 : 0,
      stock: 40 + index,
      tags: [category.name, brand.name, "cooling", "ac"],
      ratingAvg: 4.1 + (index % 5) * 0.15,
      ratingCount: 18 + index * 2,
      isFeatured: index % 4 === 0,
      isNewArrival: index < 8,
      isBestSeller: index % 3 === 0,
      isTrending: index % 5 === 0,
      onSale: index % 4 === 0,
      isActive: true,
    };
  });

  for (const p of productSeed) {
    await prisma.product.create({ data: p });
  }

  console.log("Cool Breeze seed completed");
  console.log(`Admin login: ${admin.email} / Admin123!`);
  console.log(`Customer login: ${customer.email} / Customer123!`);
}

seedDatabase()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
