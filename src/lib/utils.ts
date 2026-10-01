import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* The type scale in globals.css uses named sizes (`text-body`, `text-meta`…).
   Without telling tailwind-merge, it reads them as colours and drops whichever
   of `text-body text-white` comes first. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["label", "meta", "body", "item", "read", "prose", "h3", "h2", "h1", "display"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
