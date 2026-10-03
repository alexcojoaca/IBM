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
    "International Business Multiplier — license, download, and trade with MetaTrader 5.",
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
