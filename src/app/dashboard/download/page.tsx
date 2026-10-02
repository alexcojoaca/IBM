import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DownloadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="shell dash">
      <aside className="dash-side">
        <div className="brand" style={{ marginBottom: "1.25rem" }}>
          IBM <span>●</span>
        </div>
        <Link href="/dashboard">My licenses</Link>
        <Link className="active" href="/dashboard/download">
          Download
        </Link>
      </aside>
      <main className="dash-main">
        <h1>Download IBM</h1>
        <div className="panel">
          <p>
            The Windows client package (`IBM-Client.zip`) will be served from here (Supabase Storage
            or <code>/public/downloads</code>).
          </p>
          <p className="muted">
            For now, place the built zip in <code>public/downloads/IBM-Client.zip</code> after your
            first deploy, then enable the button below.
          </p>
          <a className="btn btn-primary" href="/downloads/IBM-Client.zip">
            Download IBM-Client.zip
          </a>
        </div>
      </main>
    </div>
  );
}
