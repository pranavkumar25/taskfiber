/** Prints the demo's shape: magic links, and how the dates sit around today. */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const now = Date.now();
  const days = (d: Date) => Math.round((d.getTime() - now) / 86400000);

  const approvals = await db.approvalRequest.findMany({
    where: { state: "WAITING" },
    orderBy: { dueAt: "asc" },
    include: {
      version: {
        include: { deliverable: { select: { name: true, client: { select: { name: true } } } } },
      },
    },
  });

  console.log(`Open approvals (${approvals.length}), relative to today:`);
  for (const a of approvals) {
    const n = a.dueAt ? days(a.dueAt) : null;
    const when = n === null ? "no due date" : n < 0 ? `${-n} d overdue` : n === 0 ? "due today" : `due in ${n} d`;
    console.log(
      `  ${a.version.deliverable.client.name.padEnd(20)} ${a.version.deliverable.name.padEnd(28)} ${when}`,
    );
  }

  const links = await db.magicLink.findMany({
    include: {
      contact: {
        select: {
          name: true,
          role: true,
          client: { select: { name: true, portal: { select: { slug: true } } } },
        },
      },
    },
  });

  console.log("\nMagic links:");
  for (const l of links) {
    const slug = l.contact.client.portal?.slug;
    if (!slug) continue;
    console.log(
      `  ${l.contact.client.name.padEnd(20)} ${l.contact.role.padEnd(13)} ${l.contact.name.padEnd(18)} /enter/${slug}/${l.token}`,
    );
  }

  await db.$disconnect();
}
main();
