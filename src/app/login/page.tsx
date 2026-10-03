"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        setError(err.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("login.failed"));
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
        <h1>{t("login.title")}</h1>
        <p>{t("login.sub")}</p>
        {error && <p className="error">{error}</p>}
        <div className="form-row">
          <label>{t("common.email")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>{t("common.password")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "…" : t("login.title")}
        </button>
        <p className="muted" style={{ marginTop: "1rem" }}>
          {t("login.noAccount")} <Link href="/register">{t("login.register")}</Link>
        </p>
      </form>
    </div>
  );
}
