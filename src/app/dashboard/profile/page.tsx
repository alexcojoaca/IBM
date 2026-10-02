"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashNav } from "@/components/DashNav";
import { createClient } from "@/lib/supabase/client";
import { LANGS } from "@/lib/langs";

export default function ProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);
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
        setLanguage(data.preferred_language || "en");
        setIsAdmin(data.role === "admin");
      }
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
      setMsg("Saved.");
      localStorage.setItem("ibm_language", language);
    }
  };

  if (!loaded) {
    return (
      <div className="shell dash">
        <DashNav active="/dashboard/profile" />
        <main className="dash-main">
          <p className="muted">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="shell dash">
      <DashNav active="/dashboard/profile" isAdmin={isAdmin} />
      <main className="dash-main">
        <h1>Profile</h1>
        <p className="muted" style={{ marginTop: "-0.5rem" }}>
          This name appears in the IBM bot after you activate your license.
        </p>
        <form className="panel" onSubmit={save} style={{ maxWidth: 480 }}>
          {error && <p className="error">{error}</p>}
          {msg && <p className="ok">{msg}</p>}
          <div className="form-row">
            <label>Email</label>
            <input value={email} disabled />
          </div>
          <div className="form-row">
            <label>Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Country</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            Save profile
          </button>
        </form>
      </main>
    </div>
  );
}
