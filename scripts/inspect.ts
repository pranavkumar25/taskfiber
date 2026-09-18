/** A scratch query runner — `npm run db:seed` style, for checking what landed. */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
  const rows = await db.deliverable.findMany({
    select: { name: true, previewKind: true, preview: true },
  });
  for (const r of rows) {
    console.log(r.previewKind.padEnd(9), r.preview ? "HAS" : "null", r.name);
  }
  await db.$disconnect();
}
main();
