import { NextResponse } from "next/server";

/** Public payment instructions (wallet is meant to be shown to buyers). */
export async function GET() {
  const wallet =
    process.env.CRYPTO_WALLET_ADDRESS?.trim() ||
    process.env.NEXT_PUBLIC_CRYPTO_WALLET?.trim() ||
    "";
  return NextResponse.json({
    wallet,
    network: process.env.CRYPTO_NETWORK || process.env.NEXT_PUBLIC_CRYPTO_NETWORK || "TRC20",
    currency: process.env.CRYPTO_CURRENCY || process.env.NEXT_PUBLIC_CRYPTO_CURRENCY || "USDT",
    amount: process.env.NEXT_PUBLIC_CRYPTO_AMOUNT || "150",
    amount_eur: 150,
  });
}
