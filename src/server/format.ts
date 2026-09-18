/**
 * Formatting.
 *
 * Every date, id, amount, version and count in this product renders in mono,
 * because the mono/sans split is how the interface says "this is data". These
 * helpers produce the exact strings the design specifies, so the same fact
 * reads identically in the portal, an email and a WhatsApp message.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** `14 Sep 2026` */
export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** `14 Sep` — used where the year is obvious from context. */
export function formatDateShort(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** `14 Sep 2026, 16:42` */
export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(date)}, ${hh}:${mm}`;
}

/** `2 h ago`, `9 d ago`, `Never`. Relative time in the product's clipped voice. */
export function formatSince(d: Date | string | null | undefined) {
  if (!d) return "Never";
  const date = typeof d === "string" ? new Date(d) : d;
  const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

/** `in 15 days`, `due today`, `3 days overdue`. */
export function formatDue(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const days = Math.round(
    (date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000,
  );
  if (days === 0) return "due today";
  if (days > 0) return `in ${days} day${days === 1 ? "" : "s"}`;
  const over = Math.abs(days);
  return `${over} day${over === 1 ? "" : "s"} overdue`;
}

/** `due 19 Sep`, `due today`, `4 d overdue` — the row-level form. */
export function formatDueCompact(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const days = Math.round(
    (new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
      86400000,
  );
  if (days === 0) return "due today";
  if (days > 0) return `due ${formatDateShort(date)}`;
  return `${Math.abs(days)} d overdue`;
}

/**
 * Indian grouping for rupees (`₹4,20,000`), standard grouping for everything
 * else. The design writes real amounts, not placeholders, so the grouping has
 * to be right.
 */
export function formatMoney(
  amount: number | string,
  currency = "INR",
  opts: { decimals?: boolean } = {},
) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  }).format(value);
}

/** `184,220` / `6,38,400` — counts follow the same grouping as money. */
export function formatCount(n: number, currency = "INR") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US").format(n);
}

/** `184k`, `1.2m` — follower counts only. */
export function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}
