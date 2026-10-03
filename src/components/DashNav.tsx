import Link from "next/link";

const LINKS = [
  { href: "/dashboard", label: "Licenses" },
  { href: "/bot/", label: "Open bot" },
  { href: "/dashboard/buy", label: "Buy license" },
  { href: "/dashboard/download", label: "Download bridge" },
  { href: "/dashboard/devices", label: "Devices" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/about", label: "About IBM" },
] as const;

export function DashNav({
  active,
  isAdmin,
}: {
  active: string;
  isAdmin?: boolean;
}) {
  return (
    <aside className="dash-side">
      <div className="brand" style={{ marginBottom: "0.35rem" }}>
        IBM <span>●</span>
      </div>
      <p className="muted" style={{ fontSize: "0.75rem", margin: "0 0 1.25rem" }}>
        International Business Multiplier
      </p>
      {LINKS.map((l) =>
        l.href.startsWith("/bot") ? (
          <a key={l.href} className={active === l.href ? "active" : undefined} href={l.href}>
            {l.label}
          </a>
        ) : (
          <Link key={l.href} className={active === l.href ? "active" : undefined} href={l.href}>
            {l.label}
          </Link>
        )
      )}
      {isAdmin && (
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
