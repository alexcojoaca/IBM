import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildAdminForest, buildDownlineTree } from "@/lib/mlm";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "mine";

  if (mode === "admin") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      return NextResponse.json({ detail: "Admin only" }, { status: 403 });
    }
    const trees = await buildAdminForest(50);
    return NextResponse.json({ trees });
  }

  const tree = await buildDownlineTree(user.id, 3);
  return NextResponse.json({ tree });
}
