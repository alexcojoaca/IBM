"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";
import { LANGS } from "@/lib/langs";

export default function SettingsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [language, setLanguage] = useState("en");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
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
      const { data } = await supabase
        .from("profiles")
        .select("role, preferred_language")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(data?.role === "admin");
      setLanguage(data?.preferred_language || localStorage.getItem("ibm_language") || "en");
    })();
  }, [router]);

  const saveLang = async (e: FormEvent) => {
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
      .update({ preferred_language: language })
      .eq("id", user.id);
    if (err) setError(err.message);
    else {
      localStorage.setItem("ibm_language", language);
      setMsg("Language saved. The desktop bot uses the same language list.");
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else {
      setPassword("");
      setPassword2("");
      setMsg("Password updated.");
    }
  };

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/settings" isAdmin={isAdmin} />
      <main className="dash-main">
        <h1>Settings</h1>
        {error && <p className="error">{error}</p>}
        {msg && <p className="ok">{msg}</p>}

        <form className="panel" onSubmit={saveLang} style={{ maxWidth: 480, marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Language</h2>
          <p className="muted">Same languages as the IBM desktop bot.</p>
          <div className="form-row">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            Save language
          </button>
        </form>

        <form className="panel" onSubmit={savePassword} style={{ maxWidth: 480 }}>
          <h2 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>Change password</h2>
          <div className="form-row">
            <label>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="form-row">
            <label>Confirm password</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Update password
          </button>
        </form>
      </main>
    </div>
  );
}
