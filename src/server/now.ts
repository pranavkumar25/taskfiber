import { cache } from "react";

/**
 * One clock per request.
 *
 * Reading the wall clock repeatedly inside a render is impure, and worse, it is
 * inconsistent: an invoice can come out "due today" in the header and "overdue"
 * in the row if the two reads straddle midnight. `cache` pins a single instant
 * for the whole render, which is what every "is this late?" comparison on a
 * screen actually means.
 */
export const requestNow = cache(() => new Date());

/** Milliseconds, for the comparisons that want a number. */
export function nowMs() {
  return requestNow().getTime();
}
