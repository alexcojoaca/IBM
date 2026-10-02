"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateLicenseKey } from "@/lib/license";

type License = {
  id: string;
  license_key: string;
  plan: string;
  status: string;
  max_devices: number;
  expires_at: string | null;
  user_id: string | null;
  created_at: string;
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
};

export default function AdminPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [email, setEmail] = useState("");
  const [days, setDays] = useState(365);
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [diag, setDiag] = useState("");
  const [payMsg, setPayMsg] = useState("");

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
      .select("role, email")
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
          "-- or --",
          `update public.profiles set role = 'admin' where lower(email) = lower('${user.email || ""}');`,
          "Then refresh this page (F5).",
        ]
          .filter(Boolean)
          .join("\n")
      );
      setAllowed(false);
      return;
    }
    setAllowed(true);
    const { data } = await supabase
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false });
    setLicenses((data as License[]) || []);
    const { data: pays } = await supabase
      .from("payment_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setPayments((pays as Payment[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

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
    setCreated(key);
    load();
  };

  const copy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created);
    setCopyMsg("Copied ✓");
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
      body.license_key
        ? `Paid → license ${body.license_key} issued`
        : "Payment confirmed"
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
        <div className="brand" style={{ marginBottom: "1.25rem" }}>
          IBM Admin
        </div>
        <Link className="active" href="/admin">
          Licenses
        </Link>
        <Link href="/dashboard">User dashboard</Link>
        <Link href="/">Landing</Link>
      </aside>
      <main className="dash-main">
        <h1>License admin</h1>
        {payMsg && <p className="ok">{payMsg}</p>}

        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Crypto payments</h2>
          <p className="muted">Confirm after you see the transfer — issues the €150 license to the buyer.</p>
          {!payments.length ? (
            <p className="muted">No payment orders.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Tx</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.created_at).toLocaleString()}</td>
                    <td>
                      <code style={{ fontSize: "0.7rem" }}>{p.user_id.slice(0, 8)}…</code>
                    </td>
                    <td>
                      <code style={{ fontSize: "0.7rem" }}>{p.tx_hash || "—"}</code>
                    </td>
                    <td>{p.status}</td>
                    <td>
                      {p.status !== "paid" && (
                        <button className="btn btn-primary" type="button" onClick={() => confirmPayment(p.id)}>
                          Confirm &amp; issue key
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form className="panel" onSubmit={create} style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Create key</h2>
          <p className="muted">1 device · default 365 days · copy once and assign to a user email</p>
          {error && <p className="error">{error}</p>}
          {created && (
            <div style={{ marginBottom: "0.75rem" }}>
              <div className="keybox">{created}</div>
              <div className="row" style={{ marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-primary" onClick={copy}>
                  Copy key
                </button>
                {copyMsg && <span className="ok">{copyMsg}</span>}
              </div>
            </div>
          )}
          <div className="row">
            <div className="form-row" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
              <label>Assign to email (optional)</label>
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

        <div className="panel">
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>All licenses</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Status</th>
                <th>Devices</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((l) => (
                <tr key={l.id}>
                  <td>
                    <code>{l.license_key}</code>
                  </td>
                  <td>{l.status}</td>
                  <td>{l.max_devices}</td>
                  <td>{l.expires_at ? new Date(l.expires_at).toLocaleDateString() : "—"}</td>
                  <td className="row">
                    <button className="btn" type="button" onClick={() => setStatus(l.id, "suspended")}>
                      Suspend
                    </button>
                    <button className="btn" type="button" onClick={() => setStatus(l.id, "active")}>
                      Reactivate
                    </button>
                    <button className="btn" type="button" onClick={() => setStatus(l.id, "revoked")}>
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
