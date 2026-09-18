/**
 * Contrast, for the one thing an agency can get wrong when theming its portal:
 * picking an accent that white button text cannot sit on. The builder warns
 * rather than forbids — it is their brand — but it always shows the number.
 */
function channel(v: number) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Ratio against white, which is what portal button text actually is. */
export function contrastOnWhite(hex: string) {
  try {
    return (1.05) / (luminance(hex) + 0.05);
  } catch {
    return 1;
  }
}

export function contrastLabel(hex: string) {
  const ratio = contrastOnWhite(hex);
  return {
    ratio: `${ratio.toFixed(1)}:1`,
    passes: ratio >= 4.5,
  };
}
