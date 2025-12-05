import app from "./app";
import config from "./config";
import { initializeDatabase } from "./config/database";

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📍 API Base URL: ${config.nodeEnv}:${config.port}/api/v1`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
