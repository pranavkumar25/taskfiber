import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ContactRole, ModuleKey } from "@/generated/prisma/enums";
import { db } from "./db";
import { portalQuery, roleSeesModule, type PortalViewer } from "./visibility";

/* ---------------------------------------------------------------------------
   Getting into a portal.

   There is no password. A contact arrives on a signed, expiring link scoped to
   exactly one of them, exchanges it for a PortalSession cookie, and that
   session is the only thing that decides what they can see.

   The one other way in is Preview as client, which requires an authenticated
   agency member. It is a real feature — an account lead has to be able to see
   what the client sees before sending the link — so it is implemented rather
   than faked, and it never widens what the portal returns.
--------------------------------------------------------------------------- */

const COOKIE = "tf_portal";

export type PortalContext = {
  viewer: PortalViewer;
  q: ReturnType<typeof portalQuery>;
  contact: { id: string; name: string; role: ContactRole };
  preview: boolean;
};

/**
 * Exchanges a magic-link token for a session. Single use, and it expires.
 * Must be called from a route handler or server action — it writes a cookie.
 */
export async function redeemMagicLink(token: string) {
  const link = await db.magicLink.findUnique({
    where: { token },
    include: { contact: { select: { id: true, clientId: true } } },
  });
  if (!link || link.expiresAt < new Date()) return null;

  const session = await db.portalSession.create({
    data: {
      token: crypto.randomUUID(),
      contactId: link.contactId,
      expiresAt: new Date(Date.now() + 14 * 86400000),
    },
  });

  await db.magicLink.update({ where: { id: link.id }, data: { usedAt: new Date() } });

  const jar = await cookies();
  jar.set(COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: session.expiresAt,
    path: "/",
  });

  await db.contact.update({
    where: { id: link.contactId },
    data: { lastActiveAt: new Date() },
  });

  return link.contact;
}

/**
 * Resolves who is looking at this portal.
 *
 * `previewRole` is honoured only for an agency member who owns the client —
 * that check happens here rather than in a page, so no route can bypass it.
 */
export const portalContext = cache(async (slug: string): Promise<PortalContext> => {
  const portal = await db.portalConfig.findUnique({
    where: { slug },
    include: {
      client: {
        select: {
          id: true,
          agencyId: true,
          contacts: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });
  if (!portal) notFound();

  const jar = await cookies();

  // A real session always wins.
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const session = await db.portalSession.findUnique({
      where: { token },
      include: { contact: { select: { id: true, name: true, role: true, clientId: true } } },
    });
    if (
      session &&
      session.expiresAt > new Date() &&
      session.contact.clientId === portal.client.id
    ) {
      return build(portal, session.contact, false);
    }
  }

  // Otherwise: a preview cookie, which /api/preview only sets after checking
  // that the caller belongs to the agency that owns this client.
  const preview = jar.get("tf_preview")?.value;
  if (preview) {
    const [previewSlug, role] = preview.split(":");
    if (previewSlug === slug) {
      const contact = portal.client.contacts.find((c) => c.role === role);
      if (contact) return build(portal, contact, true);
    }
  }

  notFound();
});

function build(
  portal: { clientId: string; client: { id: string; agencyId: string } },
  contact: { id: string; name: string; role: ContactRole },
  preview: boolean,
): PortalContext {
  const viewer: PortalViewer = {
    contactId: contact.id,
    clientId: portal.client.id,
    agencyId: portal.client.agencyId,
    role: contact.role,
    name: contact.name,
  };
  return { viewer, q: portalQuery(viewer), contact, preview };
}

/** The nav, and whether this role can open a given module. */
export async function portalNav(ctx: PortalContext) {
  const modules = await ctx.q.navModules();
  return modules.map((m) => ({
    key: m.key as ModuleKey,
    label: m.label,
    href: hrefFor(m.key as ModuleKey),
    open: roleSeesModule(m, ctx.viewer.role),
  }));
}

export function hrefFor(key: ModuleKey) {
  const map: Partial<Record<ModuleKey, string>> = {
    OVERVIEW: "",
    TIMELINE: "/timeline",
    DELIVERABLES: "/deliverables",
    DASHBOARDS: "/dashboard",
    DOCUMENTS: "/documents",
    CONTRACTS: "/contracts",
    INVOICES: "/invoices",
    UPDATES: "/updates",
    REQUESTS: "/requests",
    TEAM: "/team",
    MEETINGS: "/meetings",
    ASSETS: "/assets",
    ROSTER: "/creators",
  };
  return map[key] ?? "";
}
