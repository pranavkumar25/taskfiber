import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/server/db";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/**
 * 6.19 · The magic-link landing.
 *
 * No password, no account, no app chrome — just the agency's mark, whose portal
 * this is, and one button. The two honest lines underneath matter more than
 * they look: a client who forwards their link is the failure mode this product
 * has to design against.
 */
export default async function EnterPage({ params, searchParams }: PageProps<"/enter/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const role = typeof sp.as === "string" ? sp.as.toUpperCase() : "APPROVER";

  const portal = await db.portalConfig.findUnique({
    where: { slug },
    include: {
      client: {
        select: {
          name: true,
          contacts: { select: { id: true, name: true, role: true } },
          agency: { select: { name: true, accentHex: true } },
        },
      },
    },
  });
  if (!portal) notFound();

  const contact =
    portal.client.contacts.find((c) => c.role === role) ?? portal.client.contacts[0];
  const link = await db.magicLink.findFirst({
    where: { contactId: contact.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const accent = portal.accentHex ?? portal.client.agency.accentHex;
  const initials = contact.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-surface px-5"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="w-full max-w-100 text-center">
        <span
          className="mx-auto flex size-11 items-center justify-center rounded-card text-h3 font-semibold text-white"
          style={{ background: accent }}
        >
          {portal.client.agency.name[0]}
        </span>

        <h1 className="mt-5 text-h2 font-semibold">{portal.client.agency.name}</h1>
        <p className="mt-1 text-read text-steel">Your portal for {portal.client.name}</p>

        <Link
          href={link ? `/enter/${slug}/${link.token}` : `/p/${slug}`}
          className={`${buttonVariants({ variant: "accent", size: "hero" })} mt-7`}
        >
          <span
            className="flex size-6 items-center justify-center rounded-full bg-white/25 text-[10px] font-semibold"
            aria-hidden
          >
            {initials}
          </span>
          Continue as {contact.name}
        </Link>

        <p className="mt-5 text-meta text-steel">
          This link is private to you and expires in 14 days.
        </p>
        <p className="mt-1 text-meta text-fog">
          Not {contact.name.split(" ")[0]}? Ask {portal.client.agency.name} for your own link.
        </p>
      </div>
    </div>
  );
}
