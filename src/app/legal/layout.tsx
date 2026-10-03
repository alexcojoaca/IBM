import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <div className="container legal">
        <header className="nav">
          <Link className="brand" href="/">
            IBM <span>●</span>
          </Link>
          <Link className="btn" href="/">
            Home
          </Link>
        </header>
        <article className="legal-doc">{children}</article>
      </div>
    </div>
  );
}
