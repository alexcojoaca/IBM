import { TronWeb } from "tronweb";
import { createServiceClient } from "@/lib/supabase/admin";
import { USDT_TRC20 } from "@/lib/tron";

type PayoutResult = {
  id: string;
  status: "paid" | "failed" | "skipped";
  txHash?: string;
  error?: string;
};

function getPrivateKey(): string | null {
  const raw = process.env.TRON_PRIVATE_KEY?.trim();
  if (!raw) return null;
  return raw.startsWith("0x") ? raw.slice(2) : raw;
}

function createTronWeb() {
  const privateKey = getPrivateKey();
  if (!privateKey) throw new Error("TRON_PRIVATE_KEY not set");

  const fullHost = process.env.TRONGRID_BASE_URL || "https://api.trongrid.io";
  const headers: Record<string, string> = {};
  const key = process.env.TRONGRID_API_KEY?.trim();
  if (key) headers["TRON-PRO-API-KEY"] = key;

  return new TronWeb({
    fullHost,
    headers,
    privateKey,
  });
}

/** Send USDT TRC20 from hot wallet to affiliate address. Amount in whole USDT (e.g. 30). */
export async function sendUsdtTrc20(toAddress: string, amountUsdt: number): Promise<string> {
  if (process.env.PAYMENTS_DEV_BYPASS === "1") {
    return `DEV_PAYOUT_${Date.now()}`;
  }

  const tronWeb = createTronWeb();
  if (!tronWeb.isAddress(toAddress)) {
    throw new Error(`Invalid TRON address: ${toAddress}`);
  }

  const decimals = 6;
  const sunAmount = Math.round(amountUsdt * Math.pow(10, decimals)).toString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contract = (await tronWeb.contract().at(USDT_TRC20)) as any;
  const txId = (await contract.transfer(toAddress, sunAmount).send({
    feeLimit: 100_000_000,
    callValue: 0,
    shouldPollResponse: false,
  })) as string;

  if (!txId || typeof txId !== "string") {
    throw new Error("USDT transfer did not return a transaction id");
  }
  return txId;
}

/**
 * Pay out pending/failed/skipped commissions for an order (or specific ids).
 * Skips earners without crypto_wallet.
 */
export async function payoutCommissions(opts?: {
  paymentOrderId?: string;
  commissionIds?: string[];
}): Promise<{ results: PayoutResult[] }> {
  const supabase = createServiceClient();

  let q = supabase
    .from("affiliate_commissions")
    .select("id, earner_id, amount_eur, payout_status, status")
    .in("payout_status", ["pending", "failed", "skipped"]);

  if (opts?.paymentOrderId) {
    q = q.eq("payment_order_id", opts.paymentOrderId);
  }
  if (opts?.commissionIds?.length) {
    q = q.in("id", opts.commissionIds);
  } else {
    q = q.eq("status", "approved");
  }

  const { data: rows, error } = await q.limit(100);
  if (error) throw new Error(error.message);

  const results: PayoutResult[] = [];
  const hasKey = !!getPrivateKey() || process.env.PAYMENTS_DEV_BYPASS === "1";

  for (const row of rows || []) {
    const { data: earner } = await supabase
      .from("profiles")
      .select("crypto_wallet")
      .eq("id", row.earner_id)
      .maybeSingle();

    const wallet = (earner?.crypto_wallet || "").trim();
    if (!wallet) {
      await supabase
        .from("affiliate_commissions")
        .update({
          payout_status: "skipped",
          payout_error: "Affiliate has no crypto_wallet",
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: "skipped", error: "No wallet" });
      continue;
    }

    if (!hasKey) {
      await supabase
        .from("affiliate_commissions")
        .update({
          payout_status: "failed",
          payout_error: "TRON_PRIVATE_KEY not configured",
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed", error: "TRON_PRIVATE_KEY missing" });
      continue;
    }

    try {
      const txHash = await sendUsdtTrc20(wallet, Number(row.amount_eur));
      await supabase
        .from("affiliate_commissions")
        .update({
          payout_status: "paid",
          payout_tx_hash: txHash,
          payout_error: null,
          paid_at: new Date().toISOString(),
          status: "paid",
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: "paid", txHash });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Payout failed";
      await supabase
        .from("affiliate_commissions")
        .update({
          payout_status: "failed",
          payout_error: msg.slice(0, 500),
        })
        .eq("id", row.id);
      results.push({ id: row.id, status: "failed", error: msg });
    }
  }

  return { results };
}
