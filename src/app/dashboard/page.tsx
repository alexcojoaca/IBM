import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, referral_code")
    .eq("id", user.id)
    .single();

  const { data: licenses } = await supabase
    .from("licenses")
    .select("id, license_key, plan, status, expires_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="shell dash">
      <aside className="dash-side">
        <div className="brand" style={{ marginBottom: "1.25rem" }}>
          IBM <span>●</span>
        </div>
        <Link className="active" href="/dashboard">
          My licenses
        </Link>
        <Link href="/dashboard/download">Download</Link>
        <Link href="/admin">Admin</Link>
        <form action="/auth/signout" method="post" style={{ marginTop: "1.5rem" }}>
          <button className="btn" type="submit">
            Sign out
          </button>
        </form>
      </aside>
      <main className="dash-main">
        <h1>Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
        <p className="muted" style={{ marginTop: "-0.5rem", marginBottom: "1.25rem" }}>
          Role: {profile?.role || "unknown"} · License keys stay here. Affiliate tools come later.
        </p>

        <div className="panel" style={{ marginBottom: "1rem" }}>
          <strong>Referral code</strong>
          <p className="muted" style={{ margin: "0.35rem 0 0" }}>
            {profile?.referral_code || "—"} (MLM / affiliates in next phase)
          </p>
        </div>

        <div className="panel">
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Licenses</h2>
          {!licenses?.length ? (
            <p className="muted">No license yet. Purchase flow arrives with crypto checkout.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <code>{l.license_key}</code>
                    </td>
                    <td>{l.plan}</td>
                    <td>{l.status}</td>
                    <td>{l.expires_at ? new Date(l.expires_at).toLocaleDateString() : "—"}</td>
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
