import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { issueLicenseForUser } from "@/lib/license-server";
import { distributeCommissions, unlockAffiliates } from "@/lib/mlm";
import { payoutCommissions } from "@/lib/tron-payout";

/** Admin confirms crypto payment → license + MLM commissions */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if ((profile?.role || "").toLowerCase() !== "admin") {
    return NextResponse.json({ detail: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const orderId = body?.order_id as string;
  if (!orderId) return NextResponse.json({ detail: "order_id required" }, { status: 400 });

  const admin = createServiceClient();
  const { data: order, error } = await admin
    .from("payment_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return NextResponse.json({ detail: "Order not found" }, { status: 404 });
  if (order.status === "paid" && order.license_id) {
    await unlockAffiliates(order.user_id);
    return NextResponse.json({ ok: true, license_id: order.license_id, already: true });
  }

  const license = await issueLicenseForUser(order.user_id, `Payment ${order.id}`);
  await admin
    .from("payment_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      license_id: license.id,
      admin_note: body.admin_note || "Confirmed by admin",
    })
    .eq("id", order.id);

  await unlockAffiliates(order.user_id);
  const dist = await distributeCommissions({
    buyerId: order.user_id,
    paymentOrderId: order.id,
    licenseId: license.id,
  });

  let payouts: Awaited<ReturnType<typeof payoutCommissions>>["results"] = [];
  try {
    payouts = (await payoutCommissions({ paymentOrderId: order.id })).results;
  } catch (e: unknown) {
    console.error("Affiliate payout error:", e);
  }

  return NextResponse.json({
    ok: true,
    license_id: license.id,
    license_key: license.license_key,
    distribution: dist,
    payouts,
  });
}
