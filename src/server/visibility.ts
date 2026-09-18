import { ContactRole, ModuleKey, Visibility } from "@/generated/prisma/enums";
import { db } from "./db";

/* ---------------------------------------------------------------------------
   The visibility chokepoint.

   This is the module that makes "nothing reaches the client automatically" a
   property of the system rather than a promise. Client-facing code NEVER
   composes its own where-clause: it asks for a viewer, and the viewer's query
   object only ever returns rows that are both (a) that client's and (b)
   CLIENT_VISIBLE, filtered further by the contact's role.

   If you find yourself importing `db` directly in a `(portal)` route, stop —
   that is the bug this file exists to prevent.
--------------------------------------------------------------------------- */

/** Who is looking, resolved from a single-contact portal session. */
export type PortalViewer = {
  contactId: string;
  clientId: string;
  agencyId: string;
  role: ContactRole;
  name: string;
};

/* --- The three predicates. They live here, server-side, and nowhere else. - */

export function canApprove(role: ContactRole) {
  return role === ContactRole.APPROVER;
}

export function canSeeInvoices(role: ContactRole) {
  return role === ContactRole.APPROVER || role === ContactRole.BILLING;
}

export function hasNeedsYou(role: ContactRole, needsYouCount: number) {
  return canApprove(role) && needsYouCount > 0;
}

/**
 * Whether a module is shared with this role.
 *
 * Note the deliberate asymmetry with the nav: the Invoices *nav item stays
 * visible* to a collaborator, and this gate fires at the screen, which then
 * explains the policy and names the approver to ask. The explanation is the
 * feature; hiding it is not. So callers use this to choose between the module
 * and its denied state — never to drop the link.
 */
export function roleSeesModule(
  module: { key: ModuleKey; roles: ContactRole[]; enabled: boolean },
  role: ContactRole,
) {
  if (!module.enabled) return false;
  if (module.key === ModuleKey.OVERVIEW) return true; // locked on
  if (module.roles.length === 0) return true; // shared with every role
  return module.roles.includes(role);
}

/* --- Where-clause fragments ---------------------------------------------- */

/** The only visibility filter in the codebase. */
const PUBLISHED = { visibility: Visibility.CLIENT_VISIBLE } as const;

/** An update may additionally be narrowed to particular contact roles. */
function updateVisibleTo(role: ContactRole) {
  return {
    ...PUBLISHED,
    OR: [{ visibleTo: { isEmpty: true } }, { visibleTo: { has: role } }],
  };
}

export class PortalAccessError extends Error {
  constructor(public readonly module: ModuleKey) {
    super(`Module ${module} is not shared with this role`);
    this.name = "PortalAccessError";
  }
}

/* --- The viewer's query surface ------------------------------------------ */

/**
 * Every read the client portal performs. Each method closes over the viewer, so
 * there is no parameter a caller could widen to reach another client's rows or
 * an internal one.
 */
export function portalQuery(viewer: PortalViewer) {
  const { clientId, role } = viewer;

  return {
    client: () =>
      db.client.findUniqueOrThrow({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          slug: true,
          brandColor: true,
          currency: true,
          gstin: true,
          vertical: true,
          agency: {
            select: {
              name: true,
              accentHex: true,
              portalDomain: true,
              customDomain: true,
              logoAsset: true,
            },
          },
        },
      }),

    portal: () =>
      db.portalConfig.findUniqueOrThrow({
        where: { clientId },
        include: { modules: { orderBy: { order: "asc" } } },
      }),

    /** The nav, in template order. Unfiltered by role, on purpose — see above. */
    navModules: async () => {
      const portal = await db.portalConfig.findUniqueOrThrow({
        where: { clientId },
        include: { modules: { orderBy: { order: "asc" } } },
      });
      return portal.modules.filter((m) => m.enabled);
    },

    projects: () =>
      db.project.findMany({
        where: { clientId, ...PUBLISHED },
        orderBy: { startDate: "asc" },
        include: {
          owner: { select: { name: true } },
          phases: { orderBy: { order: "asc" } },
        },
      }),

    /** Phases and milestones. Internal milestones never cross. */
    timeline: async (projectId: string) => {
      const project = await db.project.findFirst({
        where: { id: projectId, clientId, ...PUBLISHED },
        include: {
          phases: { orderBy: { order: "asc" } },
          milestones: {
            where: PUBLISHED,
            orderBy: { date: "asc" },
          },
        },
      });
      return project;
    },

    deliverables: () =>
      db.deliverable.findMany({
        where: { clientId, ...PUBLISHED },
        orderBy: { publishedAt: "desc" },
        include: {
          owner: { select: { name: true } },
          versions: {
            where: { publishedAt: { not: null } },
            orderBy: { createdAt: "desc" },
          },
        },
      }),

    deliverable: (id: string) =>
      db.deliverable.findFirst({
        where: { id, clientId, ...PUBLISHED },
        include: {
          owner: { select: { name: true } },
          project: { select: { id: true, name: true } },
          versions: {
            where: { publishedAt: { not: null } },
            orderBy: { createdAt: "desc" },
            include: {
              records: {
                orderBy: { decidedAt: "desc" },
                include: { approver: { select: { name: true } } },
              },
              requests: {
                include: { approver: { select: { id: true, name: true } } },
              },
            },
          },
          comments: {
            where: PUBLISHED,
            orderBy: { createdAt: "asc" },
            include: {
              authorMember: { select: { name: true } },
              authorContact: { select: { name: true } },
            },
          },
        },
      }),

    updates: () =>
      db.update.findMany({
        where: { project: { clientId }, ...updateVisibleTo(role) },
        orderBy: { publishedAt: "desc" },
        include: { author: { select: { name: true } } },
      }),

    documents: () =>
      db.document.findMany({
        where: { clientId, ...PUBLISHED },
        orderBy: { modifiedAt: "desc" },
      }),

    contracts: () =>
      db.contract.findMany({
        where: { clientId, ...PUBLISHED },
        orderBy: { termEnd: "asc" },
      }),

    /**
     * Invoices. The role gate is enforced here as well as at the screen, so a
     * mistake upstream cannot leak a ledger.
     */
    // Async so the refusal arrives as a rejection, like every other method
    // here — a caller should never have to guard this one differently.
    invoices: async () => {
      if (!canSeeInvoices(role)) throw new PortalAccessError(ModuleKey.INVOICES);
      return db.invoice.findMany({
        where: { clientId },
        orderBy: { dueAt: "desc" },
      });
    },

    roster: () =>
      db.rosterMember.findMany({
        where: { clientId },
        orderBy: { followers: "desc" },
        include: { posts: { orderBy: { postedAt: "desc" } } },
      }),

    assets: () =>
      db.asset.findMany({ where: { clientId, ...PUBLISHED } }),

    meetings: () =>
      db.meeting.findMany({
        where: { clientId, ...PUBLISHED },
        orderBy: { heldAt: "desc" },
      }),

    widgets: () =>
      db.dashboardWidget.findMany({
        where: { portal: { clientId } },
        orderBy: { order: "asc" },
      }),

    /**
     * What is waiting on this contact. Empty for anyone who cannot approve —
     * which is why the Needs you block simply does not render for them.
     */
    needsYou: async () => {
      if (!canApprove(role)) return [];
      return db.approvalRequest.findMany({
        where: {
          approverId: viewer.contactId,
          state: "WAITING",
          version: {
            publishedAt: { not: null },
            deliverable: { clientId, ...PUBLISHED },
          },
        },
        orderBy: { dueAt: "asc" },
        include: {
          version: {
            include: {
              deliverable: { select: { id: true, name: true, type: true } },
            },
          },
        },
      });
    },
  };
}

export type PortalQuery = ReturnType<typeof portalQuery>;
