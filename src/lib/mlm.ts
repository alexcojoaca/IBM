import { createServiceClient } from "@/lib/supabase/admin";
import { LICENSE_PRICE_EUR } from "@/lib/license-server";

/** Product €150 split when sale is via affiliate network */
export const MLM = {
  price: LICENSE_PRICE_EUR, // 150
  companyBase: 100,
  levels: [30, 15, 5] as const, // L1, L2, L3 — sum 50
};

export type TreeNode = {
  id: string;
  full_name: string | null;
  email: string | null;
  referral_code: string | null;
  level: number;
  children: TreeNode[];
};

/** Walk up to 3 sponsors above the buyer */
export async function getUpline(buyerId: string): Promise<{ id: string; level: number }[]> {
  const supabase = createServiceClient();
  const upline: { id: string; level: number }[] = [];
  let currentId: string | null = buyerId;

  for (let level = 1; level <= 3; level++) {
    if (!currentId) break;
    const result = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", currentId)
      .maybeSingle();
    const parentId: string | null = (result.data?.referred_by as string | null) || null;
    if (!parentId) break;
    upline.push({ id: parentId, level });
    currentId = parentId;
  }
  return upline;
}

/**
 * Distribute €150:
 * - No referrer → company keeps full 150 (no commission rows)
 * - With network → company 100 + L1 30 + L2 15 + L3 5
 *   Missing levels' amounts are recorded as company residual (no row; implied)
 */
export async function distributeCommissions(opts: {
  buyerId: string;
  paymentOrderId?: string | null;
  licenseId?: string | null;
}) {
  const supabase = createServiceClient();
  const upline = await getUpline(opts.buyerId);

  // Avoid double-pay for same buyer+license
  if (opts.licenseId) {
    const { count } = await supabase
      .from("affiliate_commissions")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", opts.buyerId)
      .eq("license_id", opts.licenseId);
    if ((count || 0) > 0) {
      return { created: 0, upline: upline.length, company: MLM.price };
    }
  }

  let paidOut = 0;
  const rows = [];
  for (const u of upline) {
    const amount = MLM.levels[u.level - 1];
    rows.push({
      buyer_id: opts.buyerId,
      earner_id: u.id,
      payment_order_id: opts.paymentOrderId || null,
      license_id: opts.licenseId || null,
      level: u.level,
      amount_eur: amount,
      status: "approved",
    });
    paidOut += amount;
  }

  if (rows.length) {
    const { error } = await supabase.from("affiliate_commissions").insert(rows);
    if (error) throw new Error(error.message);
  }

  const company = MLM.price - paidOut; // 150 if direct; 100–145 if partial tree
  return { created: rows.length, upline: upline.length, company, paidOut };
}

export async function unlockAffiliates(userId: string) {
  const supabase = createServiceClient();
  await supabase.from("profiles").update({ affiliates_unlocked: true }).eq("id", userId);
}

export async function buildDownlineTree(rootId: string, maxDepth = 3): Promise<TreeNode | null> {
  const supabase = createServiceClient();

  async function loadNode(id: string, level: number): Promise<TreeNode | null> {
    const { data: me } = await supabase
      .from("profiles")
      .select("id, full_name, email, referral_code")
      .eq("id", id)
      .maybeSingle();
    if (!me) return null;

    let children: TreeNode[] = [];
    if (level < maxDepth) {
      const { data: kids } = await supabase
        .from("profiles")
        .select("id")
        .eq("referred_by", id);
      for (const k of kids || []) {
        const child = await loadNode(k.id, level + 1);
        if (child) children.push(child);
      }
    }

    return {
      id: me.id,
      full_name: me.full_name,
      email: me.email,
      referral_code: me.referral_code,
      level,
      children,
    };
  }

  return loadNode(rootId, 0);
}

export async function buildAdminForest(maxRoots = 40): Promise<TreeNode[]> {
  const supabase = createServiceClient();
  // Roots = users with no referrer (or orphaned tops)
  const { data: roots } = await supabase
    .from("profiles")
    .select("id")
    .is("referred_by", null)
    .order("created_at", { ascending: true })
    .limit(maxRoots);

  const trees: TreeNode[] = [];
  for (const r of roots || []) {
    const t = await buildDownlineTree(r.id, 3);
    if (t) trees.push(t);
  }
  return trees;
}
