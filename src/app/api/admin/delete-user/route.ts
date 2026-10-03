import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

/** Admin: wipe user completely (auth + profile + licenses + payments + commissions). */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile?.role || "").toLowerCase() !== "admin") {
    return NextResponse.json({ detail: "Admin only" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const userId = typeof body.user_id === "string" ? body.user_id.trim() : "";
  if (!userId) return NextResponse.json({ detail: "user_id required" }, { status: 400 });
  if (userId === user.id) {
    return NextResponse.json({ detail: "Cannot delete your own admin account" }, { status: 400 });
  }

  const admin = createServiceClient();

  // Break referral tree links pointing at this user
  await admin.from("profiles").update({ referred_by: null }).eq("referred_by", userId);

  // Commissions involving this user
  await admin.from("affiliate_commissions").delete().eq("buyer_id", userId);
  await admin.from("affiliate_commissions").delete().eq("earner_id", userId);

  // Payments
  await admin.from("payment_orders").delete().eq("user_id", userId);

  // Licenses + devices
  const { data: licenses } = await admin.from("licenses").select("id").eq("user_id", userId);
  const licenseIds = (licenses || []).map((l) => l.id);
  if (licenseIds.length) {
    await admin.from("license_devices").delete().in("license_id", licenseIds);
    await admin.from("affiliate_commissions").delete().in("license_id", licenseIds);
    await admin.from("licenses").delete().in("id", licenseIds);
  }

  // Profile row (auth delete also cascades, but clear first for FK safety)
  await admin.from("profiles").delete().eq("id", userId);

  // Auth user — removes login forever
  const { error: authErr } = await admin.auth.admin.deleteUser(userId);
  if (authErr) {
    return NextResponse.json(
      { detail: `Data wiped, but auth delete failed: ${authErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, deleted: userId });
}
