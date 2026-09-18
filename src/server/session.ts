import { cache } from "react";
import { db } from "./db";

/* ---------------------------------------------------------------------------
   Who is working.

   The agency side will be authenticated with better-auth. Until that is wired,
   a fallback resolves the seeded owner so the screens can be built, driven and
   demonstrated.

   That fallback is an auth bypass, so it does not get to be implicit. In
   production it runs only when TASKFIBER_DEMO_MODE is set, which is a thing
   somebody has to type into a dashboard on purpose — and the name says what it
   is, so nobody mistakes the deployment for a real one.
--------------------------------------------------------------------------- */

const demoMode = process.env.TASKFIBER_DEMO_MODE === "1";

if (demoMode && process.env.NODE_ENV === "production") {
  console.warn(
    "[taskfiber] TASKFIBER_DEMO_MODE is on: the agency side has no authentication " +
      "and every visitor is signed in as the seeded owner. Do not use this for real client data.",
  );
}

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
      "No agency workspace found. The database is reachable but empty — run the seed " +
        "against it: DATABASE_URL='<your connection string>' npm run db:seed:remote",
    );
  }

  if (process.env.NODE_ENV === "production" && !demoMode) {
    throw new Error(
      "The agency side has no authentication yet. Set TASKFIBER_DEMO_MODE=1 to run this " +
        "deployment as an unauthenticated demo, or wire better-auth before shipping it.",
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
