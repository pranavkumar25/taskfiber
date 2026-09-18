import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 reads the migration connection URL from here rather than from the
 * schema. Migrations want a direct connection, so `DIRECT_URL` wins where a
 * pooler sits in front of the database (Supabase); otherwise `DATABASE_URL`
 * serves both. The runtime client connects separately, through the driver
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
