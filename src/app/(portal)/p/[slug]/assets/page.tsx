import { portalContext } from "@/server/portal-session";
import { formatSince } from "@/server/format";
import { Card } from "@/components/ui/surface";

export const dynamic = "force-dynamic";

type Preview =
  | { kind: "lockup"; bg: string; fg: string; word: string; sub: string }
  | { kind: "mark"; bg: string; fg: string }
  | { kind: "swatches"; colors: string[] }
  | { kind: "type"; sample: string; name: string; weights: string };

/** Assets — the brand kit, rendered rather than listed as filenames. */
export default async function PortalAssets({ params }: PageProps<"/p/[slug]/assets">) {
  const { slug } = await params;
  const ctx = await portalContext(slug);
  const [client, assets] = await Promise.all([ctx.q.client(), ctx.q.assets()]);

  return (
    <div className="mx-auto w-full max-w-190 px-5 pt-8 pb-16">
      <h1 className="text-display font-semibold">Assets</h1>
      <p className="mt-1.5 text-read text-steel">
        Approved brand assets, ready to use. Synced from Drive ·{" "}
        {formatSince(assets[0]?.syncedAt ?? null)}.
      </p>

      <div
        className="mt-6 grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {assets.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <AssetPreview preview={a.preview as unknown as Preview} />
            <div className="border-t border-ash p-3">
              <p className="text-body font-medium text-charcoal">{a.name}</p>
              <p className="mt-0.5 text-meta text-steel">{a.caption}</p>
            </div>
          </Card>
        ))}
      </div>

      {assets.length === 0 ? (
        <p className="mt-8 text-read text-steel">
          {client.agency.name} has not published an asset library yet.
        </p>
      ) : null}
    </div>
  );
}

function AssetPreview({ preview }: { preview: Preview }) {
  if (!preview) return <div className="aspect-4/3 bg-canvas" />;

  if (preview.kind === "lockup" || preview.kind === "mark") {
    return (
      <div
        className="flex aspect-4/3 flex-col items-center justify-center gap-2"
        style={{ background: preview.bg, color: preview.fg }}
      >
        <svg
          viewBox="0 0 48 16"
          className="h-4 w-12"
          fill="none"
          stroke={preview.fg}
          strokeWidth={1.5}
          aria-hidden
        >
          <path d="M1 11c4-6 8-6 12 0s8 6 12 0 8-6 12 0 8 6 10 2" />
        </svg>
        {preview.kind === "lockup" ? (
          <>
            <span className="text-[13px] tracking-[0.22em]">{preview.word}</span>
            <span className="text-[9px] tracking-[0.3em] opacity-70">{preview.sub}</span>
          </>
        ) : null}
      </div>
    );
  }

  if (preview.kind === "swatches") {
    return (
      <div className="aspect-4/3">
        <div className="grid h-full grid-cols-2 grid-rows-2">
          {preview.colors.map((c) => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-4/3 flex-col items-center justify-center gap-1 bg-canvas">
      <span className="text-[40px] leading-none font-semibold text-charcoal">
        {preview.sample}
      </span>
      <span className="text-[10px] tracking-[0.18em] text-steel">{preview.name}</span>
      <span className="font-mono text-meta text-fog">{preview.weights}</span>
    </div>
  );
}
