import "dotenv/config"; // Crucial for loading process.env
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Adjusted path: from config/ to database/prisma/
  schema: "../database/prisma/schema.prisma",

  migrations: {
    path: "../database/prisma/migrations",
  },

  datasource: {
    // Use the env() helper for better CLI compatibility
    url: env("DATABASE_URL"),
  },
});
