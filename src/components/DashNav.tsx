"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  active: string;
  isAdmin?: boolean;
  showAffiliates?: boolean;
};

export function DashNav({ active, isAdmin, showAffiliates }: Props) {
  const [admin, setAdmin] = useState(!!isAdmin);
  const [affiliates, setAffiliates] = useState(!!showAffiliates || !!isAdmin);

  useEffect(() => {
    if (isAdmin !== undefined && showAffiliates !== undefined) {
      setAdmin(!!isAdmin);
      setAffiliates(!!showAffiliates || !!isAdmin);
      return;
    }
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, affiliates_unlocked")
        .eq("id", user.id)
        .maybeSingle();
      const isAdm = profile?.role === "admin";
      setAdmin(isAdm);
      if (isAdm || profile?.affiliates_unlocked) {
        setAffiliates(true);
        return;
      }
      const { data: lic } = await supabase
        .from("licenses")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1);
      setAffiliates(!!(lic && lic.length));
    })();
  }, [isAdmin, showAffiliates]);

  const links: { href: string; label: string; external?: boolean }[] = [
    { href: "/dashboard", label: "Licenses" },
    { href: "/bot/", label: "Open bot", external: true },
    { href: "/dashboard/buy", label: "Buy license" },
    { href: "/dashboard/download", label: "Download bridge" },
    { href: "/dashboard/devices", label: "Devices" },
  ];
  if (affiliates) {
    links.push({ href: "/dashboard/affiliates", label: "Affiliates" });
  }
  links.push(
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/settings", label: "Settings" },
    { href: "/dashboard/about", label: "About IBM" }
  );

  return (
    <aside className="dash-side">
      <div className="brand" style={{ marginBottom: "0.35rem" }}>
        IBM <span>●</span>
      </div>
      <p className="muted" style={{ fontSize: "0.75rem", margin: "0 0 1.25rem" }}>
        International Business Multiplier
      </p>
      {links.map((l) =>
        l.external ? (
          <a key={l.href} className={active === l.href ? "active" : undefined} href={l.href}>
            {l.label}
          </a>
        ) : (
          <Link key={l.href} className={active === l.href ? "active" : undefined} href={l.href}>
            {l.label}
          </Link>
        )
      )}
      {admin && (
        <Link className={active === "/admin" ? "active" : undefined} href="/admin">
          Admin
        </Link>
      )}
      <form action="/auth/signout" method="post" style={{ marginTop: "1.5rem" }}>
        <button className="btn" type="submit">
          Sign out
        </button>
      </form>
    </aside>
  );
}
