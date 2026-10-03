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
    "IBM is a rules-based MetaTrader 5 desk and a three-level affiliate program. License payments are verified on-chain.",
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
