import { env } from "@common/config/env";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export async function runDatabaseMigrations() {
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const migrationDb = drizzle(migrationClient);

  try {
    await migrate(migrationDb, { migrationsFolder: "./drizzle" });
  } finally {
    await migrationClient.end();
  }
}
