"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Deliverable previews.

   "Previews are real." A creative set renders the actual ads, a Figma frame
   renders the actual lockup with its pinned comment, and a reel renders the
   actual vertical video card. A grey rectangle would tell a client nothing,
   and telling them is the entire point of the portal.

   Every preview sits under a 40px chrome strip naming its source and how stale
   it is, because a client should never have to ask where something came from.
--------------------------------------------------------------------------- */

export type CreativeTile = {
  bg: string;
  fg: string;
  eyebrow: string;
  headline: string;
  offer: string;
};

export type FigmaPreview = {
  brandColor: string;
  paperColor: string;
  accentColor: string;
  word: string;
  sub: string;
  palette: string[];
};

export type ReelPreview = {
  gradient: [string, string, string];
  handle: string;
  caption: string;
  progress: number;
  duration: string;
  postingPlan: string[];
};

export function PreviewFrame({
  source,
  version,
  children,
  className,
}: {
  source: React.ReactNode;
  version?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-card border border-ash bg-surface", className)}>
      <div className="flex h-10 items-center gap-2 border-b border-ash px-3 text-body text-steel">
        <span className="size-3 shrink-0 rounded-[2px] border border-smoke" />
        <span className="min-w-0 flex-1 truncate">{source}</span>
        {version ? <span className="shrink-0 font-mono text-meta">{version}</span> : null}
      </div>
      <div className="flex min-h-70 items-center justify-center bg-canvas p-6">{children}</div>
    </div>
  );
}

/** A set of ads, rendered. */
export function CreativeSet({ tiles }: { tiles: CreativeTile[] }) {
  return (
    <div
      className="grid w-full max-w-150 gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
    >
      {tiles.map((t) => (
        <div
          key={t.headline}
          className="flex aspect-square flex-col justify-between rounded-chip p-4"
          style={{ background: t.bg, color: t.fg }}
        >
          <span className="text-[11px] font-medium tracking-[0.08em] uppercase opacity-80">
            {t.eyebrow}
          </span>
          <span className="text-[22px] leading-tight font-semibold text-balance">
            {t.headline}
          </span>
          <span className="text-meta opacity-85">{t.offer}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * A live Figma frame with its pinned annotation.
 *
 * The pin is a numbered teardrop anchored to a normalised coordinate, so it
 * stays on the thing it points at whatever the frame's rendered size.
 */
export function FigmaFrame({
  preview,
  pin,
}: {
  preview: FigmaPreview;
  pin?: {
    x: number;
    y: number;
    author: string;
    at: string;
    body: string;
    reply?: { author: string; body: string };
  } | null;
}) {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="w-full max-w-160">
      <div className="relative">
        <div
          className="grid aspect-16/10 gap-px overflow-hidden rounded-chip bg-ash"
          style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}
        >
          <div
            className="row-span-2 flex flex-col items-center justify-center gap-3"
            style={{ background: preview.brandColor, color: preview.paperColor }}
          >
            <Wave color={preview.paperColor} />
            <span className="text-[13px] tracking-[0.22em]">{preview.word}</span>
            <span className="text-[9px] tracking-[0.3em] opacity-70">{preview.sub}</span>
          </div>
          <div
            className="flex flex-col items-center justify-center gap-2 bg-surface"
            style={{ color: preview.brandColor }}
          >
            <Wave color={preview.brandColor} small />
            <span className="text-[11px] tracking-[0.22em]">{preview.word}</span>
          </div>
          <div
            className="flex items-center justify-center gap-2"
            style={{ background: preview.paperColor }}
          >
            {preview.palette.map((c) => (
              <span key={c} className="size-5 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>

        {pin ? (
          <>
            <button
              type="button"
              title="Pinned comment"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="absolute z-10 flex size-5.5 items-center justify-center rounded-[11px_11px_11px_2px] border-2 border-white bg-warning text-[11px] font-semibold text-white shadow-[0_1px_2px_rgb(23_23_23/0.2)]"
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              1
            </button>
            {open ? (
              <div
                className="animate-enter absolute z-10 w-60 rounded-card border border-ash bg-surface p-3 text-body shadow-overlay"
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  transform: "translate(12px, 4px)",
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-charcoal">{pin.author}</span>
                  <span className="font-mono text-meta text-fog">{pin.at}</span>
                </div>
                <p className="mt-1 text-steel">{pin.body}</p>
                {pin.reply ? (
                  <p className="mt-2 border-t border-canvas pt-2 text-steel">{pin.reply.body}</p>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {pin ? (
        <p className="mt-2 text-center text-meta text-fog">
          Click the pin to show or hide the comment.
        </p>
      ) : null}
    </div>
  );
}

function Wave({ color, small }: { color: string; small?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={small ? "h-3 w-9" : "h-4 w-12"}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M1 11c4-6 8-6 12 0s8 6 12 0 8-6 12 0 8 6 10 2" />
    </svg>
  );
}

/** A vertical video, with the posting plan beside it. */
export function ReelCard({ preview }: { preview: ReelPreview }) {
  const [g1, g2, g3] = preview.gradient;
  return (
    <div className="flex w-full max-w-125 flex-wrap items-start justify-center gap-6">
      <div
        className="relative flex aspect-9/16 w-55 shrink-0 flex-col justify-between overflow-hidden rounded-[14px] p-3"
        style={{ background: `linear-gradient(180deg, ${g1}, ${g2} 55%, ${g3})` }}
      >
        <span className="flex items-center gap-1.5 self-start rounded-full bg-black/25 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
          <span className="size-2.5 rounded-full bg-white/80" />
          {preview.handle.replace("@", "")}
        </span>

        <span className="absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/35 backdrop-blur-sm">
          <Play className="size-5 translate-x-px fill-charcoal text-charcoal" strokeWidth={0} />
        </span>

        <span className="flex flex-col gap-2">
          <span className="text-[11px] leading-snug text-white/95">{preview.caption}</span>
          <span className="h-[3px] w-full rounded-full bg-white/30">
            <span
              className="block h-full rounded-full bg-white"
              style={{ width: `${preview.progress}%` }}
            />
          </span>
        </span>
      </div>

      <div className="max-w-60 text-body text-steel">
        <p className="label-caps">Posting plan</p>
        {preview.postingPlan.map((line) => (
          <p key={line} className="mt-1.5">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Documents and web builds get a named placeholder, not a mystery box. */
export function DocumentPreview({ label }: { label: string }) {
  return (
    <div className="flex w-full max-w-150 flex-col items-center gap-2">
      <div className="flex aspect-16/10 w-full items-center justify-center rounded-chip border border-ash bg-surface">
        <span className="text-meta text-fog">{label}</span>
      </div>
    </div>
  );
}
