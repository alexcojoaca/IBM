import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { issueLicenseForUser } from "@/lib/license-server";
import { distributeCommissions, unlockAffiliates } from "@/lib/mlm";

/**
 * Test unlock: simulates a recognized €150 payment.
 * Disabled on the live site unless MLM_TEST_CODE is set explicitly.
 */
export async function POST(req: Request) {
  const expected = (process.env.MLM_TEST_CODE || "").trim().toUpperCase();
  if (!expected) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  if (!code || code !== expected) {
    return NextResponse.json({ detail: "Invalid test code" }, { status: 400 });
  }

  const admin = createServiceClient();

  // Ensure referral_code exists
  const { data: profile } = await admin
    .from("profiles")
    .select("id, referral_code, affiliates_unlocked")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ detail: "Profile missing" }, { status: 400 });

  if (!profile.referral_code) {
    const codeNew = Math.random().toString(36).slice(2, 10).toUpperCase();
    await admin.from("profiles").update({ referral_code: codeNew }).eq("id", user.id);
  }

  let licenseId: string | null = null;
  let licenseKey: string | null = null;
  const { data: existingLic } = await admin
    .from("licenses")
    .select("id, license_key")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (existingLic) {
    licenseId = existingLic.id;
    licenseKey = existingLic.license_key;
  } else {
    const lic = await issueLicenseForUser(user.id, "MLM test unlock");
    licenseId = lic.id;
    licenseKey = lic.license_key;
  }

  // Fake payment order for ledger
  const { data: order } = await admin
    .from("payment_orders")
    .insert({
      user_id: user.id,
      amount_eur: 150,
      currency: "USDT",
      network: "TEST",
      wallet_address: "TEST",
      tx_hash: `TEST-${Date.now()}`,
      status: "paid",
      paid_at: new Date().toISOString(),
      license_id: licenseId,
      admin_note: "MLM test unlock code",
    })
    .select("id")
    .single();

  await unlockAffiliates(user.id);
  const dist = await distributeCommissions({
    buyerId: user.id,
    paymentOrderId: order?.id || null,
    licenseId,
  });

  return NextResponse.json({
    ok: true,
    license_key: licenseKey,
    affiliates_unlocked: true,
    distribution: dist,
  });
}
