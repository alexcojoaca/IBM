"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [refCode, setRefCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = (search.get("ref") || "").trim().toUpperCase();
    if (ref) {
      setRefCode(ref);
      try {
        localStorage.setItem("ibm_ref", ref);
      } catch {
        /* ignore */
      }
    } else {
      try {
        const saved = (localStorage.getItem("ibm_ref") || "").toUpperCase();
        if (saved) setRefCode(saved);
      } catch {
        /* ignore */
      }
    }
  }, [search]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const referral = refCode.trim().toUpperCase();

      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            ...(referral ? { referral_code: referral } : {}),
          },
          emailRedirectTo: `${origin}/login`,
        },
      });

      if (err) {
        const msg = err.message || "";
        if (/rate limit/i.test(msg)) {
          setError(t("register.rateLimit"));
        } else {
          setError(msg);
        }
        return;
      }

      if (!data.user) {
        setError(t("register.couldNot"));
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setInfo(t("register.created"));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("register.unexpected"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell auth-wrap">
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <LanguageSwitcher compact />
      </div>
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>{t("register.title")}</h1>
        <p>{t("register.sub")}</p>
        {error && <p className="error">{error}</p>}
        {info && <p className="ok">{info}</p>}
        <div className="form-row">
          <label>{t("common.fullName")}</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>{t("common.email")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>{t("register.passwordLabel")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? t("register.creating") : t("register.submit")}
        </button>
        <p className="muted" style={{ marginTop: "1rem" }}>
          {t("register.haveAccount")} <Link href="/login">{t("nav.login")}</Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="shell auth-wrap">
          <p className="muted">{t("common.loading")}</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
