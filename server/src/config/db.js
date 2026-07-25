const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("MySQL connected via Prisma");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  await prisma.$disconnect();
}

module.exports = { connectDB, disconnectDB, prisma };