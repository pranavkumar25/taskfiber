import { cache } from "react";
import { db } from "./db";

/* ---------------------------------------------------------------------------
   Who is working.

   The agency side is authenticated with better-auth. Until that is wired, a
   development fallback resolves the seeded owner so the screens can be built
   and driven — it is guarded by NODE_ENV and throws in production, so it cannot
   quietly become the auth model.
--------------------------------------------------------------------------- */

export type Workspace = Awaited<ReturnType<typeof currentWorkspace>>;

export const currentWorkspace = cache(async () => {
  const member = await db.member.findFirst({
    where: { role: "OWNER" },
    orderBy: { createdAt: "asc" },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
          slug: true,
          vertical: true,
          city: true,
          accentHex: true,
          portalDomain: true,
          customDomain: true,
          plan: true,
          seats: true,
          syncMode: true,
          emailSender: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error(
      "No agency workspace found. Run `npm run db:seed`, or sign up at /signup.",
    );
  }

  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_SESSION) {
    throw new Error(
      "currentWorkspace() is still on its development fallback. Wire better-auth before deploying.",
    );
  }

  return { member, agency: member.agency };
});

/** The counts the sidebar carries. */
export const sidebarCounts = cache(async (agencyId: string) => {
  const [clients, deals, needsYou] = await Promise.all([
    db.client.count({ where: { agencyId } }),
    db.deal.count({ where: { agencyId, stage: { not: "LOST" } } }),
    db.approvalRequest.count({
      where: {
        state: "WAITING",
        version: { deliverable: { client: { agencyId } } },
      },
    }),
  ]);
  return { clients, deals, needsYou };
});
