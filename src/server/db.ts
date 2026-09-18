import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * The Prisma client.
 *
 * Prisma 7 connects through a driver adapter rather than a URL in the schema.
 * The singleton guard keeps hot reload from opening a new pool per edit.
 *
 * Note what this module deliberately does NOT export: a way to update or delete
 * an `approvalRecord`. See `approvals.ts` — the record is append-only, and the
 * only writer is `recordDecision`.
 */
const connectionString = process.env.DATABASE_URL;

function createClient() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Start the bundled Postgres with `docker compose up -d`, or point it at a Supabase project. See .env.example.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
