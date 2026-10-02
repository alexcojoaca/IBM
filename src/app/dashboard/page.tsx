import Link from "next/link";
import { redirect } from "next/navigation";
import { DashNav } from "@/components/DashNav";
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
    .select("id, license_key, plan, status, expires_at, created_at, max_devices")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="shell dash">
      <DashNav active="/dashboard" isAdmin={profile?.role === "admin"} />
      <main className="dash-main">
        <h1>Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
        <p className="muted" style={{ marginTop: "-0.5rem", marginBottom: "1.25rem" }}>
          Your IBM licenses stay here — copy the key into the desktop bot anytime.
        </p>

        {!licenses?.length && (
          <div className="panel" style={{ marginBottom: "1rem" }}>
            <strong>No license yet</strong>
            <p className="muted" style={{ margin: "0.35rem 0 0.75rem" }}>
              Professional plan · €150 · 1 year · 1 device
            </p>
            <Link className="btn btn-primary" href="/dashboard/buy">
              Buy license
            </Link>
          </div>
        )}

        <div className="panel" style={{ marginBottom: "1rem" }}>
          <strong>Referral code</strong>
          <p className="muted" style={{ margin: "0.35rem 0 0" }}>
            {profile?.referral_code || "—"} (affiliate network rolls out next)
          </p>
        </div>

        <div className="panel">
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Licenses</h2>
          {!licenses?.length ? (
            <p className="muted">None yet.</p>
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
