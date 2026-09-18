/** Prints a magic link per contact, for walking the portal as each role. */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
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
  for (const l of links) {
    const slug = l.contact.client.portal?.slug;
    if (!slug) continue;
    console.log(
      `${l.contact.client.name.padEnd(20)} ${l.contact.role.padEnd(13)} ${l.contact.name.padEnd(18)} /enter/${slug}/${l.token}`,
    );
  }
  await db.$disconnect();
}
main();
