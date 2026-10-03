import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { companyWalletStatus } from "@/lib/tron";

/** Admin-only snapshot of the company wallet. Does not return private keys. */
export async function GET() {
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

  const wallet = await companyWalletStatus();
  return NextResponse.json(wallet);
}
