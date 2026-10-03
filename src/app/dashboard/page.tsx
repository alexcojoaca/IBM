"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/LanguageProvider";

type License = {
  id: string;
  license_key: string;
  plan: string;
  status: string;
  expires_at: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
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
        .select("full_name, role, referral_code")
        .eq("id", user.id)
        .maybeSingle();
      setName(profile?.full_name || "");
      setIsAdmin(profile?.role === "admin");
      setRefCode(profile?.referral_code || "");
      const { data } = await supabase
        .from("licenses")
        .select("id, license_key, plan, status, expires_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setLicenses((data as License[]) || []);
      setLoaded(true);
    })();
  }, [router]);

  if (!loaded) {
    return (
      <div className="shell dash">
        <DashNav active="/dashboard" />
        <main className="dash-main">
          <p className="muted">{t("common.loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="shell dash">
      <DashNav active="/dashboard" isAdmin={isAdmin} />
      <main className="dash-main">
        <h1>{name ? t("dash.welcomeNamed", { name }) : t("dash.welcome")}</h1>
        <p className="muted" style={{ marginTop: "-0.5rem", marginBottom: "1.25rem" }}>
          {t("dash.sub")}
        </p>

        {!licenses.length && (
          <div className="panel" style={{ marginBottom: "1rem" }}>
            <strong>{t("dash.noLicense")}</strong>
            <p className="muted" style={{ margin: "0.35rem 0 0.75rem" }}>
              {t("dash.planLine")}
            </p>
            <Link className="btn btn-primary" href="/dashboard/buy">
              {t("dash.buy")}
            </Link>
          </div>
        )}

        <div className="panel" style={{ marginBottom: "1rem" }}>
          <strong>{t("dash.referral")}</strong>
          <p className="muted" style={{ margin: "0.35rem 0 0" }}>
            {refCode || "—"} {t("dash.referralHint")}
          </p>
        </div>

        <div className="panel">
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>{t("dash.licenses")}</h2>
          {!licenses.length ? (
            <p className="muted">{t("dash.noneYet")}</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>{t("dash.colKey")}</th>
                  <th>{t("dash.colPlan")}</th>
                  <th>{t("dash.colStatus")}</th>
                  <th>{t("dash.colExpires")}</th>
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
