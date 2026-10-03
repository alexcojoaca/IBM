"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { NetworkPyramid, type PyramidNode } from "@/components/NetworkPyramid";
import { createClient } from "@/lib/supabase/client";

type Comm = {
  id: string;
  level: number;
  amount_eur: number;
  status: string;
  created_at: string;
  buyer_id: string;
};

export default function AffiliatesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [wallet, setWallet] = useState("");
  const [comms, setComms] = useState<Comm[]>([]);
  const [tree, setTree] = useState<PyramidNode | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [testCode, setTestCode] = useState("");
  const [busy, setBusy] = useState(false);

  const site =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "";

  const affiliateLink = useMemo(() => {
    if (!refCode) return "";
    return `${site.replace(/\/$/, "")}/register?ref=${refCode}`;
  }, [site, refCode]);

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
      .select("full_name, role, referral_code, crypto_wallet, affiliates_unlocked")
      .eq("id", user.id)
      .maybeSingle();

    const admin = profile?.role === "admin";
    setIsAdmin(admin);
    setName(profile?.full_name || "");
    setRefCode(profile?.referral_code || "");
    setWallet(profile?.crypto_wallet || "");

    const { data: licenses } = await supabase
      .from("licenses")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active");

    const open = admin || !!profile?.affiliates_unlocked || !!(licenses && licenses.length);
    setUnlocked(open);

    if (!open) {
      setLoaded(true);
      return;
    }

    // Ensure referral code
    if (!profile?.referral_code) {
      const code = Math.random().toString(36).slice(2, 10).toUpperCase();
      await supabase.from("profiles").update({ referral_code: code }).eq("id", user.id);
      setRefCode(code);
    }

    const { data: c } = await supabase
      .from("affiliate_commissions")
      .select("id, level, amount_eur, status, created_at, buyer_id")
      .eq("earner_id", user.id)
      .order("created_at", { ascending: false });
    setComms((c as Comm[]) || []);

    const treeRes = await fetch("/api/mlm/tree");
    if (treeRes.ok) {
      const body = await treeRes.json();
      setTree((body.tree as PyramidNode) || null);
    }
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const saveWallet = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase
      .from("profiles")
      .update({ crypto_wallet: wallet.trim() || null })
      .eq("id", user.id);
    if (err) setError(err.message);
    else setMsg("Crypto wallet saved.");
  };

  const copyLink = async () => {
    if (!affiliateLink) return;
    await navigator.clipboard.writeText(affiliateLink);
    setMsg("Affiliate link copied.");
  };

  const runTestUnlock = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/mlm/test-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: testCode }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || "Failed");
      setMsg(
        `Test payment OK. License ${body.license_key}. Affiliates unlocked. Company residual €${body.distribution?.company ?? "—"}`
      );
      setTestCode("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const earned = comms.reduce((s, c) => s + Number(c.amount_eur || 0), 0);

  if (!loaded) {
    return (
      <div className="shell dash">
        <DashNav active="/dashboard/affiliates" />
        <main className="dash-main">
          <p className="muted">Loading…</p>
        </main>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="shell dash">
        <DashNav active="/dashboard/affiliates" isAdmin={isAdmin} showAffiliates={false} />
        <main className="dash-main">
          <h1>Affiliates</h1>
          <div className="panel" style={{ maxWidth: 520 }}>
            <p>
              The affiliate program unlocks after your €150 license payment is confirmed.
            </p>
            <a className="btn btn-primary" href="/dashboard/buy">
              Buy license
            </a>
            <form onSubmit={runTestUnlock} style={{ marginTop: "1.25rem" }}>
              <p className="muted">Testing? Enter the test unlock code:</p>
              <div className="row">
                <input
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="IBM-TEST-MLM-2026"
                  style={{ flex: 1, minWidth: 180 }}
                />
                <button className="btn" disabled={busy} type="submit">
                  Unlock test
                </button>
              </div>
              {error && <p className="error">{error}</p>}
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/affiliates" isAdmin={isAdmin} showAffiliates />
      <main className="dash-main">
        <h1>Affiliates</h1>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          Welcome{name ? `, ${name}` : ""}. 3 levels · €30 / €15 / €5 · product €150
        </p>
        {msg && <p className="ok">{msg}</p>}
        {error && <p className="error">{error}</p>}

        <div className="stat-grid">
          <div className="stat-card">
            <span className="muted">Your earnings</span>
            <strong>€{earned.toFixed(0)}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Direct (L1)</span>
            <strong>{tree?.children.length || 0}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Level 2</span>
            <strong>{tree?.children.reduce((n, c) => n + c.children.length, 0) || 0}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Level 3</span>
            <strong>
              {tree?.children.reduce(
                (n, c) => n + c.children.reduce((m, d) => m + d.children.length, 0),
                0
              ) || 0}
            </strong>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Your affiliate link</h2>
          <p className="muted">
            Share this link. When someone buys through it, you earn €30; their recruits pay you €15;
            third level €5. Company keeps €100 (+ any empty levels).
          </p>
          <div className="keybox">{affiliateLink || "Generating…"}</div>
          <button className="btn btn-primary" type="button" style={{ marginTop: "0.65rem" }} onClick={copyLink}>
            Copy link
          </button>
        </div>

        <form className="panel" onSubmit={saveWallet} style={{ marginBottom: "1rem", maxWidth: 560 }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Your USDT wallet</h2>
          <p className="muted">Where we send your affiliate share (TRC20 recommended).</p>
          <div className="form-row">
            <label>Wallet address</label>
            <input
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="T…"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Save wallet
          </button>
        </form>

        <div className="panel" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Your network</h2>
          <NetworkPyramid root={tree} title="3-level pyramid" />
        </div>

        <div className="panel" style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Commission history</h2>
          {!comms.length ? (
            <p className="muted">No commissions yet — share your link.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Level</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {comms.map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.created_at).toLocaleString()}</td>
                    <td>L{c.level}</td>
                    <td>€{Number(c.amount_eur).toFixed(0)}</td>
                    <td>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form className="panel" onSubmit={runTestUnlock} style={{ maxWidth: 560 }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Test unlock</h2>
          <p className="muted">
            Simulates a paid €150 order (for demos). Code: <code>IBM-TEST-MLM-2026</code>
          </p>
          <div className="row">
            <input
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              placeholder="IBM-TEST-MLM-2026"
              style={{ flex: 1 }}
            />
            <button className="btn" disabled={busy} type="submit">
              Run test payment
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
