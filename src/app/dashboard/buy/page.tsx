"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  status: string;
  amount_eur: number;
  currency: string;
  network: string;
  tx_hash: string | null;
  created_at: string;
  license_id: string | null;
};

type PayConfig = {
  wallet: string;
  network: string;
  currency: string;
  amount: string;
  amount_eur: number;
};

export default function BuyPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [cfg, setCfg] = useState<PayConfig | null>(null);

  const load = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    setIsAdmin(profile?.role === "admin");
    const { data } = await supabase
      .from("payment_orders")
      .select("id, status, amount_eur, currency, network, tx_hash, created_at, license_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) || []);
  };

  useEffect(() => {
    load();
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((j) => setCfg(j))
      .catch(() => setCfg({ wallet: "", network: "TRC20", currency: "USDT", amount: "150", amount_eur: 150 }));
  }, []);

  const copyWallet = async () => {
    if (!cfg?.wallet) return;
    await navigator.clipboard.writeText(cfg.wallet);
    setCopyMsg("Copied ✓");
    setTimeout(() => setCopyMsg(""), 2000);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_hash: txHash }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || "Failed");
      setMsg(
        txHash
          ? "Payment submitted. We will unlock your license after the transfer is confirmed."
          : "Order created. Send the payment, then submit again with your transaction hash."
      );
      setTxHash("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const wallet = cfg?.wallet || "";
  const network = cfg?.network || "TRC20";
  const currency = cfg?.currency || "USDT";
  const amountCrypto = cfg?.amount || "150";

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/buy" isAdmin={isAdmin} />
      <main className="dash-main">
        <h1>Buy license</h1>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          Professional · 1 year · 1 device · €150
        </p>

        <div className="panel" style={{ marginBottom: "1rem", maxWidth: 560 }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Crypto payment</h2>
          {!cfg ? (
            <p className="muted">Loading payment details…</p>
          ) : (
            <>
              <p>
                Price: <strong>€150</strong> — pay{" "}
                <strong>
                  {amountCrypto} {currency}
                </strong>{" "}
                on <strong>{network}</strong> to:
              </p>
              {wallet ? (
                <div style={{ marginBottom: "0.75rem" }}>
                  <div className="keybox">{wallet}</div>
                  <button className="btn" type="button" style={{ marginTop: "0.5rem" }} onClick={copyWallet}>
                    Copy address
                  </button>
                  {copyMsg && <span className="ok" style={{ marginLeft: 8 }}>{copyMsg}</span>}
                </div>
              ) : (
                <p className="error">
                  Wallet missing on server. On Vercel set CRYPTO_WALLET_ADDRESS (or NEXT_PUBLIC_CRYPTO_WALLET),
                  then Redeploy.
                </p>
              )}
            </>
          )}
          <p className="muted">
            After paying, paste the transaction hash below. Your license appears under Licenses once
            payment is confirmed.
          </p>
          <form onSubmit={submit}>
            {error && <p className="error">{error}</p>}
            {msg && <p className="ok">{msg}</p>}
            <div className="form-row">
              <label>Transaction hash (recommended)</label>
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste tx hash after you pay"
              />
            </div>
            <button className="btn btn-primary" disabled={loading} type="submit">
              {loading ? "Submitting…" : "I paid — submit order"}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Your orders</h2>
          {!orders.length ? (
            <p className="muted">No orders yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Tx</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                    <td>
                      €{o.amount_eur} / {o.currency} {o.network}
                    </td>
                    <td>{o.status}</td>
                    <td>
                      <code style={{ fontSize: "0.75rem" }}>{o.tx_hash || "—"}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
