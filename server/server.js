const app = require("./src/app");
const env = require("./src/config/env");
const { connectDB } = require("./src/config/db");

async function startServer() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});