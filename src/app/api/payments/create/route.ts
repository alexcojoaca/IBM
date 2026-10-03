import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { issueLicenseForUser, LICENSE_PRICE_EUR } from "@/lib/license-server";
import { distributeCommissions, unlockAffiliates } from "@/lib/mlm";

/** Create payment order. With tx_hash → auto-issue license + MLM immediately. */
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

  // Same tx already paid → return existing license (idempotent)
  if (txHash) {
    const { data: prior } = await admin
      .from("payment_orders")
      .select("id, license_id, status, user_id")
      .eq("tx_hash", txHash)
      .eq("status", "paid")
      .maybeSingle();
    if (prior?.license_id) {
      const { data: lic } = await admin
        .from("licenses")
        .select("id, license_key")
        .eq("id", prior.license_id)
        .maybeSingle();
      return NextResponse.json({
        order: prior,
        license_id: prior.license_id,
        license_key: lic?.license_key || null,
        already: true,
      });
    }
  }

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

  // No hash yet — order stays pending until user submits with tx
  if (!txHash) {
    return NextResponse.json({ order });
  }

  try {
    const license = await issueLicenseForUser(user.id, `Auto-paid ${order.id}`);
    await admin
      .from("payment_orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        license_id: license.id,
        admin_note: "Auto-confirmed on tx submit",
      })
      .eq("id", order.id);

    await unlockAffiliates(user.id);
    const dist = await distributeCommissions({
      buyerId: user.id,
      paymentOrderId: order.id,
      licenseId: license.id,
    });

    return NextResponse.json({
      order: { ...order, status: "paid", license_id: license.id },
      license_id: license.id,
      license_key: license.license_key,
      distribution: dist,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "License issue failed";
    return NextResponse.json({ detail: msg, order }, { status: 500 });
  }
}
