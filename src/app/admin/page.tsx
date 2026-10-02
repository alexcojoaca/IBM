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

export default function AdminPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [email, setEmail] = useState("");
  const [days, setDays] = useState(365);
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const load = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAllowed(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      setAllowed(false);
      return;
    }
    setAllowed(true);
    const { data } = await supabase
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false });
    setLicenses((data as License[]) || []);
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
          <p>Your account is not an admin. Set role = admin in Supabase for your user.</p>
          <Link className="btn btn-primary" href="/dashboard">
            Back
          </Link>
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
