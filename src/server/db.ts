import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * The Prisma client.
 *
 * Prisma 7 connects through a driver adapter rather than a URL in the schema.
 *
 * Constructed **lazily**, on first use rather than on import. Next collects page
 * data at build time by importing the whole module graph, and a build machine
 * has no DATABASE_URL — so a client built at module scope takes the entire build
 * down with it. Nothing here touches the database until a request actually asks
 * a question of it.
 *
 * Note what this module deliberately does NOT export: a way to update or delete
 * an `approvalRecord`. See `approvals.ts` — the record is append-only, and the
 * only writer is `recordDecision`.
 */
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Locally: `npm run db:up`. On a host: set it to your Postgres connection string. See .env.example.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

function client() {
  // The singleton also keeps hot reload from opening a new pool per edit.
  return (globalForPrisma.prisma ??= createClient());
}

export const db = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop, receiver) {
    const value = Reflect.get(client(), prop, receiver);
    return typeof value === "function" ? value.bind(client()) : value;
  },
});
