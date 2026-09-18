import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/server/db";
import { currentWorkspace } from "@/server/session";

/**
 * Preview as client.
 *
 * An account lead has to be able to see exactly what a contact sees before
 * sending the link — that is the feature that defuses the accidental-leak fear.
 * It is a real session, not a mock: this route verifies the caller is a member
 * of the agency that owns the client, then sets a short-lived preview cookie
 * that `portalContext` reads. It never widens what a portal query returns.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const role = req.nextUrl.searchParams.get("role")?.toUpperCase() ?? "APPROVER";
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  const { agency } = await currentWorkspace();

  const portal = await db.portalConfig.findUnique({
    where: { slug },
    select: { client: { select: { agencyId: true } } },
  });
  if (!portal || portal.client.agencyId !== agency.id) {
    return NextResponse.json({ error: "Not your client" }, { status: 403 });
  }

  const res = NextResponse.redirect(new URL(`/p/${slug}`, req.url));
  res.cookies.set("tf_preview", `${slug}:${role}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 30,
    path: "/",
  });
  return res;
}
