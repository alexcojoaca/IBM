"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";
import { LANGS, type LangCode } from "@/lib/langs";
import { useI18n } from "@/i18n/LanguageProvider";
import { TERMS_VERSION } from "@/lib/legal";

export default function ProfilePage() {
  const router = useRouter();
  const { t, setLanguage } = useI18n();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLocalLanguage] = useState<LangCode>("en");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [termsAt, setTermsAt] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

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
      setEmail(user.email || "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, country, preferred_language, role")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setCountry(data.country || "");
        setLocalLanguage((data.preferred_language as LangCode) || "en");
        setIsAdmin(data.role === "admin");
      }
      const { data: legal } = await supabase
        .from("profiles")
        .select("terms_accepted_at, terms_version")
        .eq("id", user.id)
        .maybeSingle();
      if (legal?.terms_accepted_at) setTermsAt(legal.terms_accepted_at);
      setLoaded(true);
    })();
  }, [router]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        country: country.trim() || null,
        preferred_language: language,
      })
      .eq("id", user.id);
    if (err) setError(err.message);
    else {
      await setLanguage(language, false);
      setMsg(t("profile.saved"));
    }
  };

  if (!loaded) {
    return (
      <div className="shell dash">
        <DashNav active="/dashboard/profile" />
        <main className="dash-main">
          <p className="muted">{t("common.loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/profile" isAdmin={isAdmin} />
      <main className="dash-main">
        <h1>{t("profile.title")}</h1>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          {t("profile.sub")}
        </p>
        <form className="panel" onSubmit={save} style={{ maxWidth: 480 }}>
          {error && <p className="error">{error}</p>}
          {msg && <p className="ok">{msg}</p>}
          <div className="form-row">
            <label>{t("common.email")}</label>
            <input value={email} disabled />
          </div>
          <div className="form-row">
            <label>{t("common.fullName")}</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>{t("profile.phone")}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-row">
            <label>{t("profile.country")}</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="form-row">
            <label>{t("common.language")}</label>
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
          {termsAt && (
            <p className="muted">
              {new Date(termsAt).toLocaleString()} · terms {TERMS_VERSION}
            </p>
          )}
          <button className="btn btn-primary" type="submit">
            {t("profile.save")}
          </button>
        </form>
      </main>
    </div>
  );
}
