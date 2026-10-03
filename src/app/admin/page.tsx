"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateLicenseKey } from "@/lib/license";
import { AdminNetworkBoard, type PyramidNode } from "@/components/NetworkPyramid";
import { useI18n } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type ProfileBrief = {
  full_name: string | null;
  email: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  referral_code: string | null;
  created_at: string;
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

type TabId = "payments" | "create" | "network" | "clients";

function statusClass(status: string) {
  if (status === "active" || status === "paid") return "badge badge-ok";
  if (status === "pending" || status === "submitted") return "badge badge-warn";
  return "badge badge-bad";
}

export default function AdminPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("payments");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
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
  const [adminId, setAdminId] = useState("");
  const [forest, setForest] = useState<PyramidNode[]>([]);
  const [busyDelete, setBusyDelete] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setDiag(t("admin.notLoggedIn"));
      setAllowed(false);
      return;
    }
    setAdminId(user.id);
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

    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, referral_code, created_at")
      .order("created_at", { ascending: false });
    setProfiles((profs as ProfileRow[]) || []);

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

  const filteredProfiles = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return profiles;
    return profiles.filter((p) => {
      const name = (p.full_name || "").toLowerCase();
      const mail = (p.email || "").toLowerCase();
      const code = (p.referral_code || "").toLowerCase();
      return name.includes(s) || mail.includes(s) || code.includes(s) || (p.role || "").includes(s);
    });
  }, [profiles, q]);

  const stats = useMemo(() => {
    const active = licenses.filter((l) => l.status === "active").length;
    const clients = profiles.filter((p) => (p.role || "").toLowerCase() !== "admin").length;
    const pendingPay = payments.filter((p) => p.status === "pending" || p.status === "submitted").length;
    return { total: licenses.length, active, clients, pendingPay, activeDevices };
  }, [licenses, payments, activeDevices, profiles]);

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
        setError(t("admin.noUser"));
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
    setCopyMsg(t("common.copied"));
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
      setPayMsg(body.detail || t("admin.confirmFailed"));
      return;
    }
    setPayMsg(
      body.license_key ? t("admin.paidIssued", { key: body.license_key }) : t("admin.paidOk")
    );
    load();
  };

  const deleteAccount = async (userId: string, label: string) => {
    if (!window.confirm(`${t("admin.deleteConfirm")}\n\n${label}`)) return;
    setBusyDelete(userId);
    setPayMsg("");
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || t("admin.deleteFailed"));
      setPayMsg(t("admin.deleted"));
      await load();
    } catch (err: unknown) {
      setPayMsg(err instanceof Error ? err.message : t("admin.deleteFailed"));
    } finally {
      setBusyDelete(null);
    }
  };

  if (allowed === null) {
    return (
      <div className="shell auth-wrap">
        <p className="muted">{t("admin.checking")}</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="shell auth-wrap">
        <div className="auth-card">
          <div style={{ marginBottom: "0.75rem" }}>
            <LanguageSwitcher compact />
          </div>
          <h1>{t("admin.only")}</h1>
          <p className="muted">{t("admin.onlySub")}</p>
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
              {t("admin.recheck")}
            </button>
            <Link className="btn" href="/dashboard">
              {t("common.back")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "payments", label: t("admin.tabPayments") },
    { id: "create", label: t("admin.tabCreate") },
    { id: "network", label: t("admin.tabNetwork") },
    { id: "clients", label: t("admin.tabClients") },
  ];

  return (
    <div className="shell dash">
      <aside className="dash-side">
        <div className="brand" style={{ marginBottom: "0.35rem" }}>
          IBM <span>●</span>
        </div>
        <p className="muted" style={{ fontSize: "0.75rem", margin: "0 0 0.75rem" }}>
          Admin · {adminName}
        </p>
        <div style={{ marginBottom: "1rem" }}>
          <LanguageSwitcher compact />
        </div>
        <Link className="active" href="/admin">
          {t("admin.overview")}
        </Link>
        <Link href="/dashboard">{t("admin.userDash")}</Link>
        <Link href="/">{t("admin.landing")}</Link>
        <button className="btn" type="button" style={{ marginTop: "1.25rem" }} onClick={() => load()}>
          {t("admin.refresh")}
        </button>
      </aside>

      <main className="dash-main">
        <div className="admin-head">
          <div>
            <h1>{t("admin.title")}</h1>
            <p className="muted" style={{ marginTop: "-0.5rem" }}>
              {t("admin.sub")}
            </p>
          </div>
          {copyMsg && <span className="ok" style={{ margin: 0 }}>{copyMsg}</span>}
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="muted">{t("admin.statLicenses")}</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">{t("admin.statActive")}</span>
            <strong>{stats.active}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">{t("admin.statClients")}</span>
            <strong>{stats.clients}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">{t("admin.statDevices")}</span>
            <strong>{stats.activeDevices}</strong>
          </div>
          <div className="stat-card">
            <span className="muted">{t("admin.statPending")}</span>
            <strong>{stats.pendingPay}</strong>
          </div>
        </div>

        <div className="admin-tabs">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              type="button"
              className={tab === tb.id ? "active" : undefined}
              onClick={() => setTab(tb.id)}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {payMsg && <p className={/fail|eșuat|error/i.test(payMsg) ? "error" : "ok"}>{payMsg}</p>}

        {tab === "payments" && (
          <div className="panel">
            <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>{t("admin.payments")}</h2>
            <p className="muted">{t("admin.paymentsSub")}</p>
            {!payments.length ? (
              <p className="muted">{t("admin.noPayments")}</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t("admin.colClient")}</th>
                      <th>{t("admin.colEmail")}</th>
                      <th>{t("admin.colDate")}</th>
                      <th>{t("admin.colAmount")}</th>
                      <th>{t("admin.colTx")}</th>
                      <th>{t("admin.colStatus")}</th>
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
                              {t("admin.confirmIssue")}
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
        )}

        {tab === "create" && (
          <form className="panel" onSubmit={create} style={{ maxWidth: 640 }}>
            <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>{t("admin.create")}</h2>
            <p className="muted">{t("admin.createSub")}</p>
            {error && <p className="error">{error}</p>}
            {created && (
              <div style={{ marginBottom: "0.75rem" }}>
                <div className="keybox">{created}</div>
                <div className="row" style={{ marginTop: "0.5rem" }}>
                  <button type="button" className="btn btn-primary" onClick={() => copyText(created)}>
                    {t("admin.copyKey")}
                  </button>
                </div>
              </div>
            )}
            <div className="row">
              <div className="form-row" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
                <label>{t("admin.clientEmail")}</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                />
              </div>
              <div className="form-row" style={{ width: 120, marginBottom: 0 }}>
                <label>{t("admin.days")}</label>
                <input
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                />
              </div>
              <button className="btn btn-primary" style={{ alignSelf: "end" }}>
                {t("admin.generate")}
              </button>
            </div>
          </form>
        )}

        {tab === "network" && (
          <div className="panel">
            <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>{t("admin.network")}</h2>
            <p className="muted">{t("admin.networkSub")}</p>
            <AdminNetworkBoard trees={forest} />
          </div>
        )}

        {tab === "clients" && (
          <>
            <div className="panel" style={{ marginBottom: "1.25rem" }}>
              <div className="admin-head" style={{ marginBottom: "0.75rem" }}>
                <h2 style={{ margin: 0, fontFamily: "var(--font-display)" }}>{t("admin.profiles")}</h2>
                <input
                  className="search-input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("admin.search")}
                />
              </div>
              {!filteredProfiles.length ? (
                <p className="muted">{t("admin.noProfiles")}</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t("admin.colClient")}</th>
                        <th>{t("admin.colEmail")}</th>
                        <th>{t("admin.colRole")}</th>
                        <th>{t("dash.referral")}</th>
                        <th>{t("admin.colActions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.full_name || "—"}</strong>
                          </td>
                          <td>{p.email || "—"}</td>
                          <td>{p.role || "user"}</td>
                          <td>
                            <code className="tiny">{p.referral_code || "—"}</code>
                          </td>
                          <td>
                            {p.id !== adminId && (p.role || "").toLowerCase() !== "admin" ? (
                              <button
                                className="btn btn-danger"
                                type="button"
                                disabled={busyDelete === p.id}
                                onClick={() =>
                                  deleteAccount(p.id, `${p.full_name || ""} ${p.email || ""}`.trim())
                                }
                              >
                                {busyDelete === p.id ? "…" : t("admin.deleteAccount")}
                              </button>
                            ) : (
                              <span className="muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="panel">
              <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>{t("admin.clients")}</h2>
              {!filteredLicenses.length ? (
                <p className="muted">{t("admin.noMatch")}</p>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{t("admin.colClient")}</th>
                        <th>{t("admin.colEmail")}</th>
                        <th>{t("admin.colKey")}</th>
                        <th>{t("admin.colPlan")}</th>
                        <th>{t("admin.colStatus")}</th>
                        <th>{t("admin.colExpires")}</th>
                        <th>{t("admin.colActions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLicenses.map((l) => (
                        <tr key={l.id}>
                          <td>
                            <strong>{l.profiles?.full_name || t("admin.unassigned")}</strong>
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
                                {t("common.copy")}
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
                                {t("admin.suspend")}
                              </button>
                              <button className="btn" type="button" onClick={() => setStatus(l.id, "active")}>
                                {t("admin.reactivate")}
                              </button>
                              <button className="btn" type="button" onClick={() => setStatus(l.id, "revoked")}>
                                {t("admin.revoke")}
                              </button>
                              {l.user_id && l.user_id !== adminId && (
                                <button
                                  className="btn btn-danger"
                                  type="button"
                                  disabled={busyDelete === l.user_id}
                                  onClick={() =>
                                    deleteAccount(
                                      l.user_id!,
                                      `${l.profiles?.full_name || ""} ${l.profiles?.email || ""}`.trim()
                                    )
                                  }
                                >
                                  {busyDelete === l.user_id ? "…" : t("admin.deleteAccount")}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
