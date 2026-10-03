/** Official USDT TRC20 contract on TRON mainnet */
export const USDT_TRC20 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

const TRONGRID = process.env.TRONGRID_BASE_URL || "https://api.trongrid.io";

export type VerifyOk = {
  ok: true;
  from: string;
  to: string;
  amount: number;
  txHash: string;
  blockTimestamp?: number;
};

export type VerifyFail = { ok: false; error: string };

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/json" };
  const key = process.env.TRONGRID_API_KEY?.trim();
  if (key) h["TRON-PRO-API-KEY"] = key;
  return h;
}

/** TronGrid answers 401 when the API key is wrong. Public reads still work without it. */
async function fetchTron(url: string): Promise<Response> {
  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  if (res.status !== 401) return res;
  return fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
}

function normalizeHash(h: string) {
  return h.trim().replace(/^0x/i, "").toLowerCase();
}

function addressesEqual(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

type Trc20Row = {
  transaction_id?: string;
  from?: string;
  to?: string;
  value?: string;
  token_info?: { symbol?: string; decimals?: number; address?: string };
  block_timestamp?: number;
  type?: string;
};

/**
 * Verify a confirmed USDT TRC20 transfer to our deposit wallet.
 * Uses TronGrid account TRC20 history (decoded) filtered by tx id.
 */
export async function verifyUsdtPayment(opts: {
  txHash: string;
  expectedTo: string;
  minAmount: number;
  expectedFrom?: string | null;
}): Promise<VerifyOk | VerifyFail> {
  const expectedTo = opts.expectedTo?.trim();
  if (!expectedTo) {
    return { ok: false, error: "Company wallet not configured (CRYPTO_WALLET_ADDRESS)" };
  }

  const txHash = opts.txHash.trim();
  if (!txHash || txHash.length < 16) {
    return { ok: false, error: "Invalid transaction hash" };
  }

  const want = normalizeHash(txHash);
  const minAmount = Number(opts.minAmount);
  if (!Number.isFinite(minAmount) || minAmount <= 0) {
    return { ok: false, error: "Invalid minimum amount" };
  }

  // DEV bypass — never enable on production Vercel
  if (process.env.PAYMENTS_DEV_BYPASS === "1") {
    return {
      ok: true,
      from: opts.expectedFrom?.trim() || "DEV_BYPASS",
      to: expectedTo,
      amount: minAmount,
      txHash,
    };
  }

  const url =
    `${TRONGRID}/v1/accounts/${encodeURIComponent(expectedTo)}/transactions/trc20` +
    `?only_confirmed=true&limit=200&contract_address=${encodeURIComponent(USDT_TRC20)}`;

  let rows: Trc20Row[] = [];
  try {
    const res = await fetchTron(url);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `TronGrid error ${res.status}. Check TRONGRID_API_KEY. ${text.slice(0, 120)}`,
      };
    }
    const json = (await res.json()) as { data?: Trc20Row[]; success?: boolean; Error?: string };
    if (json.Error) return { ok: false, error: `TronGrid: ${json.Error}` };
    rows = json.data || [];
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? `TronGrid request failed: ${e.message}` : "TronGrid request failed",
    };
  }

  const match = rows.find((r) => normalizeHash(r.transaction_id || "") === want);
  if (!match) {
    // Fallback: scan a few pages via fingerprint if available — also try TronScan-style single lookup
    const byId = await fetchTransferByTxId(txHash, expectedTo);
    if (!byId.ok) {
      return {
        ok: false,
        error:
          "Transaction not found as a confirmed USDT deposit to our wallet yet. Wait for confirmation, then retry.",
      };
    }
    return finalizeMatch(byId, opts, expectedTo, minAmount, txHash);
  }

  const decimals = match.token_info?.decimals ?? 6;
  const raw = Number(match.value || 0);
  const amount = raw / Math.pow(10, decimals);
  const from = match.from || "";
  const to = match.to || "";

  return finalizeMatch({ ok: true, from, to, amount, txHash, blockTimestamp: match.block_timestamp }, opts, expectedTo, minAmount, txHash);
}

async function fetchTransferByTxId(
  txHash: string,
  expectedTo: string
): Promise<VerifyOk | VerifyFail> {
  // TronGrid events for this tx
  const url = `${TRONGRID}/v1/transactions/${encodeURIComponent(txHash)}/events`;
  try {
    const res = await fetchTron(url);
    if (!res.ok) return { ok: false, error: "tx events not found" };
    const json = (await res.json()) as {
      data?: Array<{
        event_name?: string;
        contract_address?: string;
        result?: { from?: string; to?: string; value?: string };
        block_timestamp?: number;
        transaction_id?: string;
      }>;
    };
    const events = json.data || [];
    for (const ev of events) {
      if ((ev.event_name || "").toLowerCase() !== "transfer") continue;
      const contract = (ev.contract_address || "").trim();
      if (contract && !addressesEqual(contract, USDT_TRC20)) continue;
      const from = ev.result?.from || "";
      const to = ev.result?.to || "";
      const raw = Number(ev.result?.value || 0);
      const amount = raw / 1e6;
      if (!to) continue;
      if (!addressesEqual(to, expectedTo)) continue;
      return {
        ok: true,
        from,
        to,
        amount,
        txHash,
        blockTimestamp: ev.block_timestamp,
      };
    }
  } catch {
    /* ignore */
  }
  return { ok: false, error: "not found" };
}

function finalizeMatch(
  match: VerifyOk | VerifyFail,
  opts: { expectedFrom?: string | null },
  expectedTo: string,
  minAmount: number,
  txHash: string
): VerifyOk | VerifyFail {
  if (!match.ok) return match;
  if (!addressesEqual(match.to, expectedTo)) {
    return { ok: false, error: `Payment sent to wrong address (got ${match.to})` };
  }
  if (match.amount + 1e-9 < minAmount) {
    return {
      ok: false,
      error: `Amount too low: received ${match.amount} USDT, need at least ${minAmount} USDT`,
    };
  }
  if (opts.expectedFrom?.trim()) {
    if (!addressesEqual(match.from, opts.expectedFrom.trim())) {
      return {
        ok: false,
        error: `Sender mismatch: TX from ${match.from}, you entered ${opts.expectedFrom.trim()}`,
      };
    }
  }
  return {
    ok: true,
    from: match.from,
    to: match.to,
    amount: match.amount,
    txHash,
    blockTimestamp: match.blockTimestamp,
  };
}

export function requiredUsdtAmount(): number {
  return Number(process.env.NEXT_PUBLIC_CRYPTO_AMOUNT || process.env.CRYPTO_AMOUNT || "150");
}

export type ChainDeposit = {
  tx: string;
  from: string;
  amount: number;
  at?: number;
};

export type WalletStatus = {
  address: string;
  activated: boolean;
  trx: number;
  usdt: number;
  deposits: ChainDeposit[];
  trongridKeySet: boolean;
  privateKeySet: boolean;
  error?: string;
};

/** Public wallet balances + recent incoming USDT. Never returns secrets. */
export async function companyWalletStatus(): Promise<WalletStatus> {
  const address = (
    process.env.CRYPTO_WALLET_ADDRESS ||
    process.env.NEXT_PUBLIC_CRYPTO_WALLET ||
    ""
  ).trim();
  const base: WalletStatus = {
    address,
    activated: false,
    trx: 0,
    usdt: 0,
    deposits: [],
    trongridKeySet: !!process.env.TRONGRID_API_KEY?.trim(),
    privateKeySet: !!process.env.TRON_PRIVATE_KEY?.trim(),
  };
  if (!address) return { ...base, error: "CRYPTO_WALLET_ADDRESS missing" };

  let keyRejected = false;
  const accountUrl = `${TRONGRID}/v1/accounts/${encodeURIComponent(address)}`;

  try {
    let accRes = await fetch(accountUrl, { headers: headers(), cache: "no-store" });
    if (accRes.status === 401) {
      keyRejected = true;
      accRes = await fetchTron(accountUrl);
    }
    if (!accRes.ok) {
      return { ...base, error: keyRejected ? "trongrid_key_rejected" : `TronGrid account ${accRes.status}` };
    }
    if (keyRejected) base.error = "trongrid_key_rejected";
    const accJson = (await accRes.json()) as {
      data?: Array<{ balance?: number; trc20?: Array<Record<string, string>> }>;
    };
    const acc = accJson.data?.[0];
    if (acc) {
      base.activated = true;
      base.trx = Number(acc.balance || 0) / 1e6;
      for (const bag of acc.trc20 || []) {
        const raw = bag[USDT_TRC20];
        if (raw != null) base.usdt = Number(raw) / 1e6;
      }
    }
  } catch (e: unknown) {
    base.error = e instanceof Error ? e.message : "TronGrid account failed";
  }

  try {
    const url =
      `${TRONGRID}/v1/accounts/${encodeURIComponent(address)}/transactions/trc20` +
      `?only_confirmed=true&limit=15&contract_address=${encodeURIComponent(USDT_TRC20)}`;
    const txRes = await fetchTron(url);
    if (txRes.ok) {
      const txJson = (await txRes.json()) as { data?: Trc20Row[] };
      base.deposits = (txJson.data || [])
        .filter((r) => addressesEqual(r.to || "", address))
        .map((r) => ({
          tx: r.transaction_id || "",
          from: r.from || "",
          amount: Number(r.value || 0) / Math.pow(10, r.token_info?.decimals ?? 6),
          at: r.block_timestamp,
        }));
    }
  } catch {
    /* deposits stay empty; balances above are enough */
  }

  return base;
}
