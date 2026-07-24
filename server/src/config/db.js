const mongoose = require("mongoose");
const env = require("./env");

async function connectDB({ retries = 5, delayMs = 2000 } = {}) {
  mongoose.set("strictQuery", true);

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("MongoDB connected");
      return mongoose.connection;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, error.message);
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };