import { NextResponse, type NextRequest } from "next/server";
import { redeemMagicLink } from "@/server/portal-session";

/**
 * Redeems a magic link.
 *
 * A route handler rather than a page, because this sets the session cookie and
 * that is the only place a cookie may be written. The token is single-use; the
 * session it mints lasts fourteen days and is scoped to one contact.
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/enter/[slug]/[token]">,
) {
  const { slug, token } = await ctx.params;
  const contact = await redeemMagicLink(token);
  return NextResponse.redirect(
    new URL(contact ? `/p/${slug}` : `/enter/${slug}?expired=1`, req.url),
  );
}
