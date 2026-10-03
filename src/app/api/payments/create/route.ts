import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { issueLicenseForUser, LICENSE_PRICE_EUR } from "@/lib/license-server";
import { distributeCommissions, unlockAffiliates } from "@/lib/mlm";
import { requiredUsdtAmount, verifyUsdtPayment } from "@/lib/tron";
import { payoutCommissions } from "@/lib/tron-payout";

/** Create payment: verify USDT TRC20 on-chain → license + MLM + affiliate payouts. */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const txHash = typeof body.tx_hash === "string" ? body.tx_hash.trim() : "";
  const fromAddress = typeof body.from_address === "string" ? body.from_address.trim() : "";

  if (!txHash) {
    return NextResponse.json(
      { detail: "Transaction hash required to unlock license" },
      { status: 400 }
    );
  }

  const admin = createServiceClient();
  const wallet =
    process.env.CRYPTO_WALLET_ADDRESS?.trim() ||
    process.env.NEXT_PUBLIC_CRYPTO_WALLET?.trim() ||
    "";
  const network = process.env.CRYPTO_NETWORK || "TRC20";
  const currency = process.env.CRYPTO_CURRENCY || "USDT";
  const minAmount = requiredUsdtAmount();

  // Global uniqueness: same paid tx never credits twice
  const { data: priorAny } = await admin
    .from("payment_orders")
    .select("id, license_id, status, user_id")
    .eq("tx_hash", txHash)
    .eq("status", "paid")
    .maybeSingle();

  if (priorAny?.license_id) {
    if (priorAny.user_id === user.id) {
      const { data: lic } = await admin
        .from("licenses")
        .select("id, license_key")
        .eq("id", priorAny.license_id)
        .maybeSingle();
      await unlockAffiliates(user.id);
      return NextResponse.json({
        order: priorAny,
        license_id: priorAny.license_id,
        license_key: lic?.license_key || null,
        already: true,
      });
    }
    return NextResponse.json(
      { detail: "This transaction hash was already used by another account" },
      { status: 400 }
    );
  }

  const verified = await verifyUsdtPayment({
    txHash,
    expectedTo: wallet,
    minAmount,
    expectedFrom: fromAddress || null,
  });

  if (!verified.ok) {
    return NextResponse.json({ detail: verified.error }, { status: 400 });
  }

  const orderPayload: Record<string, unknown> = {
    user_id: user.id,
    amount_eur: LICENSE_PRICE_EUR,
    currency,
    network,
    wallet_address: wallet,
    tx_hash: txHash,
    from_address: verified.from || fromAddress || null,
    verified_amount: verified.amount,
    status: "submitted",
    admin_note: `Verified ${verified.amount} USDT from ${verified.from}`,
  };

  let { data: order, error } = await admin
    .from("payment_orders")
    .insert(orderPayload)
    .select("*")
    .single();

  // Fallback before payments_tron.sql migration
  if (error && /from_address|verified_amount/i.test(error.message)) {
    delete orderPayload.from_address;
    delete orderPayload.verified_amount;
    ({ data: order, error } = await admin
      .from("payment_orders")
      .insert(orderPayload)
      .select("*")
      .single());
  }

  if (error) {
    if (/unique|duplicate/i.test(error.message)) {
      return NextResponse.json(
        { detail: "This transaction hash was already used" },
        { status: 400 }
      );
    }
    return NextResponse.json({ detail: error.message }, { status: 400 });
  }
  if (!order) {
    return NextResponse.json({ detail: "Could not create payment order" }, { status: 500 });
  }

  try {
    const license = await issueLicenseForUser(user.id, `USDT paid ${order.id}`);
    await admin
      .from("payment_orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        license_id: license.id,
        admin_note: `Verified ${verified.amount} USDT from ${verified.from} → license issued`,
      })
      .eq("id", order.id);

    await unlockAffiliates(user.id);
    const dist = await distributeCommissions({
      buyerId: user.id,
      paymentOrderId: order.id,
      licenseId: license.id,
    });

    let payouts = { results: [] as Awaited<ReturnType<typeof payoutCommissions>>["results"] };
    try {
      payouts = await payoutCommissions({ paymentOrderId: order.id });
    } catch (pe: unknown) {
      // License already issued — payout can be retried from admin
      console.error("Affiliate payout error:", pe);
    }

    return NextResponse.json({
      order: { ...order, status: "paid", license_id: license.id },
      license_id: license.id,
      license_key: license.license_key,
      verified: {
        from: verified.from,
        to: verified.to,
        amount: verified.amount,
      },
      distribution: dist,
      payouts: payouts.results,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "License issue failed";
    return NextResponse.json({ detail: msg, order }, { status: 500 });
  }
}
