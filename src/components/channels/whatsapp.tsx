import * as React from "react";
import { Check } from "lucide-react";
import type { WhatsAppTemplate } from "@/server/channels";
import { cn } from "@/lib/utils";

/**
 * The WhatsApp templates, rendered as they arrive.
 *
 * The copy comes from `src/server/channels.ts`, the same builders the send path
 * uses — so what an agency reviews here is literally what a client receives.
 */
export function WhatsAppThread({
  agency,
  accentHex,
  verified,
  dayDivider,
  messages,
  className,
}: {
  agency: string;
  accentHex: string;
  verified?: boolean;
  dayDivider?: string;
  messages: (
    | { from: "agency"; template: WhatsAppTemplate; at: string }
    | { from: "client"; text: string; at: string }
    | { from: "agency"; text: string; at: string; plain: true }
  )[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-90 shrink-0 flex-col overflow-hidden rounded-[28px] border border-smoke bg-[#EFEAE2] shadow-card",
        className,
      )}
    >
      {/* Chrome */}
      <div className="flex items-center gap-2.5 bg-[#F6F6F6] px-3.5 py-3">
        <span
          className="flex size-8.5 shrink-0 items-center justify-center rounded-full text-body font-semibold text-white"
          style={{ background: accentHex }}
        >
          {agency[0]}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1 text-body font-medium text-charcoal">
            <span className="truncate">{agency}</span>
            {verified ? (
              <span className="flex size-3 shrink-0 items-center justify-center rounded-full bg-success">
                <Check className="size-2 text-white" strokeWidth={4} aria-hidden />
              </span>
            ) : null}
          </span>
          <span className="block text-meta text-steel">Business account</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 py-4">
        {dayDivider ? (
          <span className="mx-auto rounded-chip bg-white/70 px-2.5 py-1 text-[11px] text-steel">
            {dayDivider}
          </span>
        ) : null}

        {messages.map((m, i) =>
          m.from === "client" ? (
            <span
              key={i}
              className="ml-auto max-w-[85%] rounded-lg rounded-tr-[2px] bg-[#D9FDD3] px-2.5 py-2 text-body text-charcoal"
            >
              {m.text}
              <span className="mt-0.5 block text-right text-[11px] text-steel">
                {m.at} ✓✓
              </span>
            </span>
          ) : "plain" in m ? (
            <span
              key={i}
              className="max-w-[85%] rounded-lg rounded-tl-[2px] bg-white px-2.5 py-2 text-body text-charcoal"
            >
              {m.text}
              <span className="mt-0.5 block text-right text-[11px] text-steel">{m.at}</span>
            </span>
          ) : (
            <Bubble key={i} template={m.template} at={m.at} />
          ),
        )}
      </div>
    </div>
  );
}

function Bubble({ template: t, at }: { template: WhatsAppTemplate; at: string }) {
  return (
    <div className="max-w-[88%]">
      <div className="rounded-lg rounded-tl-[2px] bg-white px-2.5 py-2">
        <p className="text-body font-semibold text-charcoal">{t.title}</p>
        <p className="mt-1 text-body text-charcoal">{renderBold(t.body)}</p>

        {t.detail ? (
          <div className="mt-2 rounded-chip bg-canvas px-2 py-1.5 font-mono text-meta text-steel">
            {t.detail.map((d) => (
              <span key={d} className="block">
                {d}
              </span>
            ))}
          </div>
        ) : null}

        <span className="mt-1 block text-right text-[11px] text-steel">{at}</span>
      </div>

      {t.cta ? (
        <div className="mt-1 rounded-lg bg-white px-2.5 py-2.5 text-center text-body font-medium text-ink">
          {t.cta.label}
        </div>
      ) : null}

      {t.quickReplies ? (
        <div className="mt-1 flex flex-col gap-1">
          {t.quickReplies.map((q) => (
            <span
              key={q}
              className="rounded-lg bg-white px-2.5 py-2.5 text-center text-body font-medium text-ink"
            >
              {q}
            </span>
          ))}
        </div>
      ) : null}

      {t.trustLine ? (
        <div className="mt-1 rounded-lg bg-white px-2.5 py-2 font-mono text-[11px] break-all text-steel">
          {t.trustLine}
        </div>
      ) : null}
    </div>
  );
}

/** WhatsApp's own *bold* markers, rendered rather than shown. */
function renderBold(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <strong key={i} className="font-semibold">
        {part.slice(1, -1)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}
