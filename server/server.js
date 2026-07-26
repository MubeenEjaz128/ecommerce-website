const app = require("./src/app");
const env = require("./src/config/env");
const { connectDB, disconnectDB } = require("./src/config/db");

let server;

async function startServer() {
  await connectDB();

  server = app.listen(env.port, "0.0.0.0", () => {
    console.log(`Server running on port ${env.port} (bound to 0.0.0.0)`);
  });
}

function handleShutdown(signal) {
  console.log(`Received ${signal}. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});