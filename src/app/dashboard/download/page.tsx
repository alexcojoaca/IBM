"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/LanguageProvider";

export default function DownloadPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasLicense, setHasLicense] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const downloadUrl =
    process.env.NEXT_PUBLIC_CLIENT_DOWNLOAD_URL || "/downloads/IBM-Client.zip";

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
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(profile?.role === "admin");
      const { data: licenses } = await supabase
        .from("licenses")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active");
      setHasLicense(!!licenses?.length);
      setLoaded(true);
    })();
  }, [router]);

  if (!loaded) {
    return (
      <div className="shell dash">
        <DashNav active="/dashboard/download" />
        <main className="dash-main">
          <p className="muted">{t("common.loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/download" isAdmin={isAdmin} />
      <main className="dash-main">
        <h1>{t("dl.title")}</h1>
        <div className="panel" style={{ maxWidth: 560 }}>
          <p>{t("dl.body")}</p>
          <ol className="muted">
            <li>{t("dl.step1")}</li>
            <li>{t("dl.step2")}</li>
            <li>
              <a href="/bot/">{t("nav.openBot")}</a> — {t("dl.step3")}
            </li>
            <li>{t("dl.step4")}</li>
          </ol>
          {!hasLicense ? (
            <p className="muted">
              {t("dl.needLicense")}{" "}
              <a href="/dashboard/buy">{t("dl.goBuy")}</a>
            </p>
          ) : (
            <a className="btn btn-primary" href={downloadUrl}>
              {t("dl.download")}
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
