"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The early-access request.
 *
 * Validation and the confirmation state are real; delivery of the request is
 * not wired yet — `onSubmit` is the one place to send it once there is a
 * destination (a table, a CRM, an inbox).
 */

/** Where "Book a call" goes. Set this to the founder's scheduling link. */
export const BOOK_A_CALL_URL = "#early-access";

const TEAM_SIZE = ["Just me", "2 to 6", "7 to 25", "26+"];
const SELLS = ["Projects", "Retainers", "Subscriptions"];
const CLIENTS = ["Under 5", "5 to 15", "16 to 50", "50+"];
const STACK = ["CRM", "Accounting", "PM tool", "WhatsApp with clients"];

type State = {
  name: string;
  email: string;
  company: string;
  teamSize: string;
  sells: string[];
  clients: string;
  stack: string[];
};

const EMPTY: State = {
  name: "",
  email: "",
  company: "",
  teamSize: "",
  sells: [],
  clients: "",
  stack: [],
};

export function EarlyAccessForm() {
  const [state, setState] = React.useState<State>(EMPTY);
  const [errors, setErrors] = React.useState<Partial<Record<keyof State, string>>>({});
  const [done, setDone] = React.useState(false);

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggle = (key: "sells" | "stack", value: string) =>
    set(
      key,
      state[key].includes(value) ? state[key].filter((v) => v !== value) : [...state[key], value],
    );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!state.name.trim()) next.name = "Your name, please.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim()))
      next.email = "A work email we can reach you at.";
    if (!state.company.trim()) next.company = "The studio or agency you run.";
    if (!state.teamSize) next.teamSize = "Pick one.";
    if (state.sells.length === 0) next.sells = "Pick at least one.";
    if (!state.clients) next.clients = "Pick one.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setDone(true);
  };

  if (done) {
    return (
      <div className="animate-enter rounded-[14px] border border-night-line bg-night-raised p-8 text-white sm:p-10" role="status">
        <span className="flex size-10 items-center justify-center rounded-full bg-emerald-400/15">
          <Check className="size-5 text-emerald-400" strokeWidth={2} />
        </span>
        <h3 className="mt-6 font-heading text-[26px] leading-tight font-bold">You&rsquo;re on the list.</h3>
        <p className="mt-3 max-w-110 text-read text-white/65">
          To move faster, book 30 minutes and walk us through how you run one client today.
        </p>
        <a
          href={BOOK_A_CALL_URL}
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-control bg-white px-5 text-item font-semibold text-night hover:bg-white/90"
        >
          Book a call
          <ArrowRight className="size-4" strokeWidth={2} />
        </a>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="rounded-[14px] border border-night-line bg-night-raised p-6 text-white sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Name"
          autoComplete="name"
          value={state.name}
          onChange={(v) => set("name", v)}
          error={errors.name}
        />
        <TextField
          label="Work email"
          type="email"
          autoComplete="email"
          value={state.email}
          onChange={(v) => set("email", v)}
          error={errors.email}
        />
        <TextField
          label="Company"
          autoComplete="organization"
          value={state.company}
          onChange={(v) => set("company", v)}
          error={errors.company}
          className="sm:col-span-2"
        />
      </div>

      <div className="mt-6 space-y-5">
        <ChoiceGroup
          label="Team size"
          options={TEAM_SIZE}
          selected={state.teamSize ? [state.teamSize] : []}
          onPick={(v) => set("teamSize", v)}
          error={errors.teamSize}
        />
        <ChoiceGroup
          label="You sell"
          hint="Any that apply"
          multi
          options={SELLS}
          selected={state.sells}
          onPick={(v) => toggle("sells", v)}
          error={errors.sells}
        />
        <ChoiceGroup
          label="Active clients"
          options={CLIENTS}
          selected={state.clients ? [state.clients] : []}
          onPick={(v) => set("clients", v)}
          error={errors.clients}
        />
        <ChoiceGroup
          label="Your stack"
          hint="Any that apply"
          multi
          options={STACK}
          selected={state.stack}
          onPick={(v) => toggle("stack", v)}
        />
      </div>

      <button
        type="submit"
        className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-white text-item font-semibold text-night hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-white/30 focus-visible:outline-none"
      >
        Request access
        <ArrowRight className="size-4" strokeWidth={2} />
      </button>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  className,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  className?: string;
  type?: string;
  autoComplete?: string;
}) {
  const id = React.useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-meta font-medium text-white/70">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-11 w-full rounded-control border bg-night px-3 text-item text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-3 focus-visible:ring-white/15",
          error ? "border-red-400/70" : "border-night-line focus:border-white/40",
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-meta text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ChoiceGroup({
  label,
  hint,
  options,
  selected,
  onPick,
  multi,
  error,
}: {
  label: string;
  hint?: string;
  options: string[];
  selected: string[];
  onPick: (v: string) => void;
  multi?: boolean;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-baseline gap-2 text-meta font-medium text-white/70">
        {label}
        {hint ? <span className="text-white/35">{hint}</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2" role={multi ? "group" : "radiogroup"}>
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={on}
              onClick={() => onPick(o)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-body focus-visible:ring-3 focus-visible:ring-white/20 focus-visible:outline-none",
                on
                  ? "border-white bg-white font-medium text-night"
                  : "border-night-line text-white/75 hover:border-white/40 hover:text-white",
              )}
            >
              {on && multi ? <Check className="size-3.5" strokeWidth={2.25} /> : null}
              {o}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-1.5 text-meta text-red-400">{error}</p> : null}
    </fieldset>
  );
}
