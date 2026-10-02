import { redirect } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/server";

export default async function DownloadPage() {
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

  const { data: licenses } = await supabase
    .from("licenses")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("status", "active");

  const hasLicense = !!licenses?.length;
  const downloadUrl =
    process.env.NEXT_PUBLIC_CLIENT_DOWNLOAD_URL || "/downloads/IBM-Client.zip";

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/download" isAdmin={profile?.role === "admin"} />
      <main className="dash-main">
        <h1>Download IBM</h1>
        <div className="panel" style={{ maxWidth: 560 }}>
          <p>
            Windows package: <code>IBM-Client.zip</code>. Unzip, run <code>Start IBM.cmd</code>, then
            enter your license key from the Licenses page.
          </p>
          {!hasLicense ? (
            <p className="muted">
              Buy a license first to unlock the download.{" "}
              <a href="/dashboard/buy">Go to Buy license →</a>
            </p>
          ) : (
            <a className="btn btn-primary" href={downloadUrl}>
              Download IBM-Client.zip
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
