"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/LanguageProvider";

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
  const { t } = useI18n();
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
      .catch(() =>
        setCfg({ wallet: "", network: "TRC20", currency: "USDT", amount: "150", amount_eur: 150 })
      );
  }, []);

  const copyWallet = async () => {
    if (!cfg?.wallet) return;
    await navigator.clipboard.writeText(cfg.wallet);
    setCopyMsg(t("common.copied"));
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
      if (!res.ok) throw new Error(body.detail || t("common.failed"));
      if (body.license_key) {
        setMsg(t("buy.msgLicensed", { key: body.license_key }));
      } else if (txHash) {
        setMsg(t("buy.msgWithHash"));
      } else {
        setMsg(t("buy.msgNoHash"));
      }
      setTxHash("");
      await load();
      if (body.license_key) {
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("common.failed"));
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
        <h1>{t("buy.title")}</h1>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          {t("buy.sub")}
        </p>

        <div className="panel" style={{ marginBottom: "1rem", maxWidth: 560 }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>{t("buy.crypto")}</h2>
          {!cfg ? (
            <p className="muted">{t("buy.loadingPay")}</p>
          ) : (
            <>
              <p>
                {t("buy.priceLine", { amount: amountCrypto, currency, network })}
              </p>
              {wallet ? (
                <div style={{ marginBottom: "0.75rem" }}>
                  <div className="keybox">{wallet}</div>
                  <button className="btn" type="button" style={{ marginTop: "0.5rem" }} onClick={copyWallet}>
                    {t("buy.copyAddr")}
                  </button>
                  {copyMsg && <span className="ok" style={{ marginLeft: 8 }}>{copyMsg}</span>}
                </div>
              ) : (
                <p className="error">{t("buy.walletMissing")}</p>
              )}
            </>
          )}
          <p className="muted">{t("buy.afterPay")}</p>
          <form onSubmit={submit}>
            {error && <p className="error">{error}</p>}
            {msg && <p className="ok">{msg}</p>}
            <div className="form-row">
              <label>{t("buy.txLabel")}</label>
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder={t("buy.txPlaceholder")}
              />
            </div>
            <button className="btn btn-primary" disabled={loading || !txHash.trim()} type="submit">
              {loading ? t("buy.submitting") : t("buy.submit")}
            </button>
          </form>
        </div>

        <div className="panel">
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>{t("buy.orders")}</h2>
          {!orders.length ? (
            <p className="muted">{t("buy.noOrders")}</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>{t("buy.colDate")}</th>
                  <th>{t("buy.colAmount")}</th>
                  <th>{t("buy.colStatus")}</th>
                  <th>{t("buy.colTx")}</th>
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
