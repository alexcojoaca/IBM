import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { payoutCommissions } from "@/lib/tron-payout";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ detail: "Unauthorized" }, { status: 401 }) };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile?.role || "").toLowerCase() !== "admin") {
    return { error: NextResponse.json({ detail: "Admin only" }, { status: 403 }) };
  }
  return { user };
}

/** List commission payouts */
export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("affiliate_commissions")
    .select(
      "id, level, amount_eur, status, payout_status, payout_tx_hash, payout_error, paid_at, created_at, earner_id, buyer_id, payment_order_id, earner:earner_id(full_name, email, crypto_wallet), buyer:buyer_id(full_name, email)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ detail: error.message }, { status: 400 });
  return NextResponse.json({ commissions: data || [] });
}

/** Retry payout for ids or all pending for an order */
export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;

  const body = await req.json().catch(() => ({}));
  const commissionIds = Array.isArray(body.commission_ids)
    ? body.commission_ids.filter((x: unknown) => typeof x === "string")
    : undefined;
  const paymentOrderId =
    typeof body.payment_order_id === "string" ? body.payment_order_id : undefined;
  const allPending = !!body.all_pending;

  try {
    if (allPending) {
      // Reset skipped/failed without wallet to pending so they re-check wallet
      const admin = createServiceClient();
      await admin
        .from("affiliate_commissions")
        .update({ payout_status: "pending", payout_error: null })
        .in("payout_status", ["failed", "skipped"])
        .eq("status", "approved");
    } else if (commissionIds?.length) {
      const admin = createServiceClient();
      await admin
        .from("affiliate_commissions")
        .update({ payout_status: "pending", payout_error: null })
        .in("id", commissionIds);
    }

    const result = await payoutCommissions({
      paymentOrderId,
      commissionIds: allPending ? undefined : commissionIds,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e: unknown) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Payout failed" },
      { status: 500 }
    );
  }
}
