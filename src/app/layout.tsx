import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

/* Geist Mono carries every date, id, amount, version and count in both
   surfaces. Pretendard is self-hosted from `public/fonts` and declared in
   `globals.css`, because the design ships the OTF files rather than a
   Google-hosted face. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "TaskFiber",
    template: "%s · TaskFiber",
  },
  description:
    "An agency workspace from which an agency builds a branded portal for each of its clients.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
