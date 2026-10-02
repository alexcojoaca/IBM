"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="shell auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Log in</h1>
        <p>Access your licenses and downloads.</p>
        {error && <p className="error">{error}</p>}
        <div className="form-row">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "…" : "Log in"}
        </button>
        <p className="muted" style={{ marginTop: "1rem" }}>
          No account? <Link href="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
