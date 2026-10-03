"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/LanguageProvider";

export default function AboutPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isAdmin, setIsAdmin] = useState(false);
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
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(profile?.role === "admin");
      setLoaded(true);
    })();
  }, [router]);

  if (!loaded) {
    return (
      <div className="shell dash">
        <DashNav active="/dashboard/about" />
        <main className="dash-main">
          <p className="muted">{t("common.loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/about" isAdmin={isAdmin} />
      <main className="dash-main">
        <h1>{t("about.title")}</h1>
        <div className="panel" style={{ maxWidth: 640 }}>
          <p style={{ fontSize: "1.15rem", marginTop: 0 }}>
            <strong>IBM</strong> — {t("brand.tagline")}
          </p>
          <p>{t("about.lead")}</p>
          <h2 style={{ fontFamily: "var(--font-display)" }}>{t("about.what")}</h2>
          <ul className="muted">
            <li>{t("about.b1")}</li>
            <li>{t("about.b2")}</li>
            <li>{t("about.b3")}</li>
            <li>{t("about.b4")}</li>
          </ul>
          <h2 style={{ fontFamily: "var(--font-display)" }}>{t("about.start")}</h2>
          <ol className="muted">
            <li>{t("about.s1")}</li>
            <li>{t("about.s2")}</li>
            <li>{t("about.s3")}</li>
            <li>{t("about.s4")}</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
