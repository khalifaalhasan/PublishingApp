import { env } from "@common/config/env";
import { closeDatabase } from "@common/db";
import { runDatabaseMigrations } from "@common/db/migrations";
import { appLogger } from "@common/logger";
import { createApp } from "./app";

async function start() {
  try {
    const app = createApp();
    const server = app.listen({
      hostname: env.HOST,
      port: env.PORT,
    });

    appLogger.info(`[SERVER] Running at ${env.HOST}:${env.PORT}`);
    appLogger.info(
      `[API] Documentation available at ${env.HOST}:${env.PORT}/docs`,
    );
    appLogger.info(
      `[HEALTH] Health check endpoint: ${env.HOST}:${env.PORT}/health`,
    );

    void runDatabaseMigrations().catch((error) => {
      appLogger.warn(
        { error },
        "[MIGRATION] Skipped at startup because database is unavailable",
      );
    });

    let isShuttingDown = false;

    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      appLogger.info(`${signal} received, shutting down gracefully...`);

      try {
        await Promise.resolve(server.stop());
        await closeDatabase();
        appLogger.info("Server closed successfully");
        process.exit(0);
      } catch (error) {
        appLogger.error({ error }, "Error during shutdown");
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    appLogger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

void start();
