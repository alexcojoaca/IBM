import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { issueLicenseForUser, LICENSE_PRICE_EUR } from "@/lib/license-server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const txHash = typeof body.tx_hash === "string" ? body.tx_hash.trim() : "";

  const admin = createServiceClient();
  const wallet = process.env.CRYPTO_WALLET_ADDRESS || "";
  const network = process.env.CRYPTO_NETWORK || "TRC20";
  const currency = process.env.CRYPTO_CURRENCY || "USDT";

  const { data: order, error } = await admin
    .from("payment_orders")
    .insert({
      user_id: user.id,
      amount_eur: LICENSE_PRICE_EUR,
      currency,
      network,
      wallet_address: wallet,
      tx_hash: txHash || null,
      status: txHash ? "submitted" : "pending",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
  return NextResponse.json({ order });
}
