const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function connectDB(retries = 5, initialDelay = 2000) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log("Database connected successfully via Prisma");
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        console.error("Max database connection retries reached. Failing startup.");
        throw error;
      }
      console.log(`Retrying database connection in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log("Database connection closed cleanly.");
  } catch (error) {
    console.error("Error disconnecting database:", error.message);
  }
}

module.exports = { connectDB, disconnectDB, prisma };