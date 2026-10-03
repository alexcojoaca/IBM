"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
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
          setError(
            "Supabase email limit hit. Disable Confirm email in Supabase Auth settings, then try again."
          );
        } else {
          setError(msg);
        }
        return;
      }

      if (!data.user) {
        setError("Could not create account. Try another email or log in.");
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setInfo("Account created. Log in after email confirmation (if enabled).");
    } catch (e: any) {
      setError(e?.message || "Unexpected error during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Create account</h1>
        <p>Your licenses and affiliate tools appear after purchase.</p>
        {refCode && (
          <p className="ok" style={{ marginTop: 0 }}>
            Invited with code <strong>{refCode}</strong>
          </p>
        )}
        {error && <p className="error">{error}</p>}
        {info && <p className="ok">{info}</p>}
        <div className="form-row">
          <label>Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password (min 8 characters)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="form-row">
          <label>Affiliate code (optional)</label>
          <input
            value={refCode}
            onChange={(e) => setRefCode(e.target.value.toUpperCase())}
            placeholder="From your invite link"
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Creating…" : "Register"}
        </button>
        <p className="muted" style={{ marginTop: "1rem" }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="shell auth-wrap">
          <p className="muted">Loading…</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
