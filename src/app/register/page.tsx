"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${origin}/login`,
        },
      });

      if (err) {
        const msg = err.message || "";
        if (/rate limit/i.test(msg)) {
          setError(
            "Supabase email limit hit. In Supabase go to: Authentication → Providers → Email → turn OFF “Confirm email”, Save, wait 1 hour (or try another email), then register again."
          );
        } else {
          setError(msg);
        }
        return;
      }

      // Some projects return empty user when email is already registered
      if (!data.user) {
        setError("Could not create account. Try another email or log in.");
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Email confirmation is ON in Supabase
      setInfo(
        "Account created. If email confirmation is enabled in Supabase, open the link from your inbox, then log in. For local testing: Supabase → Authentication → Providers → Email → disable “Confirm email”."
      );
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
        <p>Your licenses will appear here after purchase.</p>
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
