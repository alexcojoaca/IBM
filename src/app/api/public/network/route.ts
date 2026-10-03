import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";

/** Public count of registered accounts. No names, emails, or wallets. */
export async function GET() {
  try {
    const admin = createServiceClient();
    const { count, error } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error) return NextResponse.json({ members: null }, { status: 200 });
    return NextResponse.json({ members: count ?? 0 });
  } catch {
    return NextResponse.json({ members: null }, { status: 200 });
  }
}
