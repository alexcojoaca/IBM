import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

const dm = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "IBM — International Business Multiplier",
  description:
    "IBM is an automated MetaTrader 5 bot built like a systematic trading desk, with a three-level network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${dm.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
