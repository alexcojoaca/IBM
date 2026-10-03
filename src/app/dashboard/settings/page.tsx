"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";
import { LANGS, type LangCode } from "@/lib/langs";
import { useI18n } from "@/i18n/LanguageProvider";

export default function SettingsPage() {
  const router = useRouter();
  const { t, lang, setLanguage } = useI18n();
  const [isAdmin, setIsAdmin] = useState(false);
  const [language, setLocalLanguage] = useState<LangCode>("en");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLocalLanguage(lang);
  }, [lang]);

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
      const { data } = await supabase
        .from("profiles")
        .select("role, preferred_language")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(data?.role === "admin");
      if (data?.preferred_language) {
        setLocalLanguage(data.preferred_language as LangCode);
      }
    })();
  }, [router]);

  const saveLang = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await setLanguage(language, true);
      setMsg(t("settings.langSaved"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("common.failed"));
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (password.length < 6) {
      setError(t("settings.passwordShort"));
      return;
    }
    if (password !== password2) {
      setError(t("settings.passwordMismatch"));
      return;
    }
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else {
      setPassword("");
      setPassword2("");
      setMsg(t("settings.passwordUpdated"));
    }
  };

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/settings" isAdmin={isAdmin} />
      <main className="dash-main">
        <h1>{t("settings.title")}</h1>
        {error && <p className="error">{error}</p>}
        {msg && <p className="ok">{msg}</p>}

        <form className="panel" onSubmit={saveLang} style={{ maxWidth: 480, marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>{t("settings.langTitle")}</h2>
          <p className="muted">{t("settings.langSub")}</p>
          <div className="form-row">
            <select
              value={language}
              onChange={(e) => {
                const code = e.target.value as LangCode;
                setLocalLanguage(code);
                void setLanguage(code, false);
              }}
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            {t("settings.saveLang")}
          </button>
        </form>

        <form className="panel" onSubmit={savePassword} style={{ maxWidth: 480 }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>
            {t("settings.passwordTitle")}
          </h2>
          <div className="form-row">
            <label>{t("settings.newPassword")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="form-row">
            <label>{t("settings.confirmPassword")}</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            {t("settings.updatePassword")}
          </button>
        </form>
      </main>
    </div>
  );
}
