import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 reads the migration connection URL from here rather than from the
 * schema. Migrations generally prefer a direct connection, so `DIRECT_URL` wins
 * when it is set; otherwise `DATABASE_URL` serves both. Neon's pooler handles
 * `migrate deploy` and the seed without complaint, so the deployment sets only
 * `DATABASE_URL`. The runtime client connects separately, through the driver
 * adapter in `src/server/db.ts`.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
