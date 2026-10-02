import { redirect } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/server";

export default async function AboutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/about" isAdmin={profile?.role === "admin"} />
      <main className="dash-main">
        <h1>About IBM</h1>
        <div className="panel" style={{ maxWidth: 640 }}>
          <p style={{ fontSize: "1.15rem", marginTop: 0 }}>
            <strong>IBM</strong> — International Business Multiplier
          </p>
          <p>
            Automated Forex trading client for MetaTrader 5. You get a dedicated license (1 year, 1
            device), the Windows bot package, and a personal dashboard for keys, devices, and
            downloads.
          </p>
          <h2 style={{ fontFamily: "var(--font-display)" }}>What you get</h2>
          <ul className="muted">
            <li>Desktop bot linked to your online license</li>
            <li>Your name shown in the app after activation</li>
            <li>Disconnect a device anytime from this platform</li>
            <li>Languages: English, Română, Italiano, Español, Français, Polski, Русский</li>
          </ul>
          <h2 style={{ fontFamily: "var(--font-display)" }}>How to start</h2>
          <ol className="muted">
            <li>Buy a license (€150)</li>
            <li>Copy your key from Licenses</li>
            <li>Download IBM-Client.zip</li>
            <li>Run Start IBM.cmd → enter the key → connect MT5</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
