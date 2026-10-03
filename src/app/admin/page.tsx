"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateLicenseKey } from "@/lib/license";
import { AdminNetworkBoard, type PyramidNode } from "@/components/NetworkPyramid";

type ProfileBrief = {
  full_name: string | null;
  email: string | null;
};

type License = {
  id: string;
  license_key: string;
  plan: string;
  status: string;
  max_devices: number;
  expires_at: string | null;
  user_id: string | null;
  created_at: string;
  profiles: ProfileBrief | null;
};

type Payment = {
  id: string;
  user_id: string;
  status: string;
  amount_eur: number;
  currency: string;
  network: string;
  tx_hash: string | null;
  created_at: string;
  license_id: string | null;
  profiles: ProfileBrief | null;
};

type DeviceRow = {
  id: string;
  license_id: string;
  is_active: boolean;
};

function statusClass(status: string) {
  if (status === "active" || status === "paid") return "badge badge-ok";
  if (status === "pending" || status === "submitted") return "badge badge-warn";
  return "badge badge-bad";
}

export default function AdminPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeDevices, setActiveDevices] = useState(0);
  const [email, setEmail] = useState("");
  const [days, setDays] = useState(365);
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [diag, setDiag] = useState("");
  const [payMsg, setPayMsg] = useState("");
  const [q, setQ] = useState("");
  const [adminName, setAdminName] = useState("");
  const [forest, setForest] = useState<PyramidNode[]>([]);

  const load = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setDiag("Not logged in. Go to /login first.");
      setAllowed(false);
      return;
    }
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", user.id)
      .maybeSingle();

    const role = (profile?.role || "").trim().toLowerCase();
    if (role !== "admin") {
      setDiag(
        [
          `Logged in as: ${user.email || user.id}`,
          `User id: ${user.id}`,
          profile
            ? `Role in profiles: "${profile.role}" (need exactly: admin)`
            : "No row in profiles for this user — run the SQL below.",
          profileErr ? `Read error: ${profileErr.message}` : "",
          "",
          "In Supabase → SQL Editor run:",
          `update public.profiles set role = 'admin' where id = '${user.id}';`,
        ]
          .filter(Boolean)
          .join("\n")
      );
      setAllowed(false);
      return;
    }
    setAllowed(true);
    setAdminName(profile?.full_name || profile?.email || "Admin");

    const { data } = await supabase
      .from("licenses")
      .select("*, profiles:user_id (full_name, email)")
      .order("created_at", { ascending: false });
    setLicenses((data as License[]) || []);

    const { data: pays } = await supabase
      .from("payment_orders")
      .select("*, profiles:user_id (full_name, email)")
      .order("created_at", { ascending: false });
    setPayments((pays as Payment[]) || []);

    const { data: devices } = await supabase
      .from("license_devices")
      .select("id, license_id, is_active")
      .eq("is_active", true);
    setActiveDevices(((devices as DeviceRow[]) || []).length);

    const treeRes = await fetch("/api/mlm/tree?mode=admin");
    if (treeRes.ok) {
      const body = await treeRes.json();
      setForest((body.trees as PyramidNode[]) || []);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredLicenses = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return licenses;
    return licenses.filter((l) => {
      const name = (l.profiles?.full_name || "").toLowerCase();
      const mail = (l.profiles?.email || "").toLowerCase();
      const key = (l.license_key || "").toLowerCase();
      return name.includes(s) || mail.includes(s) || key.includes(s) || l.status.includes(s);
    });
  }, [licenses, q]);

  const stats = useMemo(() => {
    const active = licenses.filter((l) => l.status === "active").length;
    const clients = new Set(licenses.map((l) => l.user_id).filter(Boolean)).size;
    const pendingPay = payments.filter((p) => p.status === "pending" || p.status === "submitted").length;
    return { total: licenses.length, active, clients, pendingPay, activeDevices };
  }, [licenses, payments, activeDevices]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setCreated("");
    setCopyMsg("");
    const supabase = createClient();
    const key = generateLicenseKey();
    const expires = new Date();
    expires.setDate(expires.getDate() + Number(days || 365));

    let userId: string | null = null;
    if (email.trim()) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();
      userId = prof?.id || null;
      if (!userId) {
        setError("No user with that email. Create the account first, or leave email empty.");
        return;
      }
    }

    const { error: err } = await supabase.from("licenses").insert({
      license_key: key,
      key_prefix: key.slice(0, 12),
      plan: "Professional",
      status: "active",
      max_devices: 1,
      expires_at: expires.toISOString(),
      user_id: userId,
    });
    if (err) {
      setError(err.message);
      return;
    }
    if (userId) {
      await supabase.from("profiles").update({ affiliates_unlocked: true }).eq("id", userId);
    }
    setCreated(key);
    setEmail("");
    load();
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopyMsg("Copied ✓");
    setTimeout(() => setCopyMsg(""), 2000);
  };

  const setStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from("licenses").update({ status }).eq("id", id);
    load();
  };

  const confirmPayment = async (orderId: string) => {
    setPayMsg("");
    const res = await fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
    const body = await res.json();
    if (!res.ok) {
      setPayMsg(body.detail || "Confirm failed");
      return;
    }
    setPayMsg(
      body.license_key ? `Paid → license ${body.license_key} issued` : "Payment confirmed"
    );
    load();
  };

  if (allowed === null) {
    return (
      <div className="shell auth-wrap">
        <p className="muted">Checking admin access…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="shell auth-wrap">
        <div className="auth-card">
          <h1>Admin only</h1>
          <p className="muted">Same login as users — admin is just your role in Supabase.</p>
          {diag && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "0.8rem",
                background: "rgba(0,0,0,0.25)",
                padding: "0.75rem",
                borderRadius: 8,
                overflow: "auto",
              }}
            >
              {diag}
            </pre>
          )}
          <div className="row" style={{ marginTop: "1rem" }}>
            <button className="btn btn-primary" type="button" onClick={() => load()}>
              Recheck
            </button>
            <Link className="btn" href="/dashboard">
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell dash">
      <aside className="dash-side">
        <div className="brand" style={{ marginBottom: "0.35rem" }}>
          IBM <span>●</span>
        </div>
        <p className="muted" style={{ fontSize: "0.75rem", margin: "0 0 1.25rem" }}>
          Admin · {adminName}
        </p>
        <Link className="active" href="/admin">
          Overview
        </Link>
        <Link href="/dashboard">User dashboard</Link>
        <Link href="/bot/">Open bot</Link>
        <Link href="/">Landing</Link>
        <button className="btn" type="button" style={{ marginTop: "1.25rem" }} onClick={() => load()}>
          Refresh data
        </button>
      </aside>

      <main className="dash-main">
        <div className="admin-head">
          <div>
            <h1>Admin dashboard</h1>
            <p className="muted" style={{ marginTop: "-0.5rem" }}>
              Clients, licenses, payments — International Business Multiplier
            </p>
          </div>
          {copyMsg && <span className="ok" style={{ margin: 0 }}>{copyMsg}</span>}
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="muted">Licenses</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Active</span>
            <strong>{stats.active}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Clients</span>
            <strong>{stats.clients}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Live devices</span>
            <strong>{stats.activeDevices}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">Pending payments</span>
            <strong>{stats.pendingPay}</strong>
          </div>
        </div>

        {payMsg && <p className="ok">{payMsg}</p>}

        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Crypto payments</h2>
          <p className="muted">Confirm transfer → issues €150 / 150 USDT license to the client.</p>
          {!payments.length ? (
            <p className="muted">No payment orders yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Tx</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.profiles?.full_name || "—"}</strong>
                      </td>
                      <td>{p.profiles?.email || "—"}</td>
                      <td>{new Date(p.created_at).toLocaleString()}</td>
                      <td>
                        €{p.amount_eur} · {p.currency} {p.network}
                      </td>
                      <td>
                        <code className="tiny">{p.tx_hash || "—"}</code>
                      </td>
                      <td>
                        <span className={statusClass(p.status)}>{p.status}</span>
                      </td>
                      <td>
                        {p.status !== "paid" && (
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => confirmPayment(p.id)}
                          >
                            Confirm &amp; issue
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form className="panel" onSubmit={create} style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Create license</h2>
          <p className="muted">1 device · assign to an existing account email</p>
          {error && <p className="error">{error}</p>}
          {created && (
            <div style={{ marginBottom: "0.75rem" }}>
              <div className="keybox">{created}</div>
              <div className="row" style={{ marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-primary" onClick={() => copyText(created)}>
                  Copy key
                </button>
              </div>
            </div>
          )}
          <div className="row">
            <div className="form-row" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
              <label>Client email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@email.com"
              />
            </div>
            <div className="form-row" style={{ width: 120, marginBottom: 0 }}>
              <label>Days</label>
              <input
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: "end" }}>
              Generate
            </button>
          </div>
        </form>

        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Network canvas</h2>
          <p className="muted">
            Full MLM map — who brought whom (3 levels). Split: company €100 · L1 €30 · L2 €15 · L3 €5.
          </p>
          <AdminNetworkBoard trees={forest} />
        </div>

        <div className="panel">
          <div className="admin-head" style={{ marginBottom: "0.75rem" }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>Clients &amp; licenses</h2>
            <input
              className="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, key…"
            />
          </div>
          {!filteredLicenses.length ? (
            <p className="muted">No licenses match.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Email</th>
                    <th>License key</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.profiles?.full_name || "Unassigned"}</strong>
                      </td>
                      <td>{l.profiles?.email || "—"}</td>
                      <td>
                        <div className="row" style={{ alignItems: "center" }}>
                          <code className="tiny">{l.license_key}</code>
                          <button
                            className="btn"
                            type="button"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                            onClick={() => copyText(l.license_key)}
                          >
                            Copy
                          </button>
                        </div>
                      </td>
                      <td>{l.plan}</td>
                      <td>
                        <span className={statusClass(l.status)}>{l.status}</span>
                      </td>
                      <td>
                        {l.expires_at ? new Date(l.expires_at).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div className="row">
                          <button className="btn" type="button" onClick={() => setStatus(l.id, "suspended")}>
                            Suspend
                          </button>
                          <button className="btn" type="button" onClick={() => setStatus(l.id, "active")}>
                            Reactivate
                          </button>
                          <button className="btn" type="button" onClick={() => setStatus(l.id, "revoked")}>
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
