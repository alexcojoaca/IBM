"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";
import { landingCopy } from "./landing-copy";

export default function HomePage() {
  const { lang } = useI18n();
  const c = landingCopy(lang);
  const [members, setMembers] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/network");
        const body = await res.json();
        if (!cancelled && typeof body.members === "number") setMembers(body.members);
      } catch {
        /* count stays hidden */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="shell lp">
      <div className="container">
        <header className="nav">
          <div className="brand">
            IBM <span>●</span>
          </div>
          <div className="nav-actions">
            <LanguageSwitcher compact />
            <Link className="btn" href="/login">
              {c.secondary}
            </Link>
            <Link className="btn btn-primary" href="/register">
              {c.primary}
            </Link>
          </div>
        </header>

        <section className="lp-hero">
          <p className="lp-kicker">{c.kicker}</p>
          <h1>{c.hero}</h1>
          <p className="lp-lead">{c.lead}</p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/register">
              {c.primary}
            </Link>
            <Link className="btn" href="/login">
              {c.secondary}
            </Link>
          </div>
        </section>

        <section className="lp-stats">
          <div>
            <strong>{members === null ? "—" : members}</strong>
            <span>{c.members}</span>
          </div>
          <div>
            <strong>150 USDT</strong>
            <span>{c.license}</span>
          </div>
          <div>
            <strong>3</strong>
            <span>{c.levels}</span>
          </div>
          <div>
            <strong>0.5%</strong>
            <span>{c.risk}</span>
          </div>
        </section>

        <section className="section">
          <h2>{c.earnTitle}</h2>
          <p className="lead">{c.earnLead}</p>
          <div className="lp-split">
            <article className="panel">
              <h3>{c.botTitle}</h3>
              <p>{c.botBody}</p>
              <ul>
                {c.botPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="panel">
              <h3>{c.affTitle}</h3>
              <p>{c.affBody}</p>
              <dl className="lp-rows">
                {c.affRows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </section>

        <section className="section">
          <h2>{c.simonsTitle}</h2>
          <p className="lead">{c.simonsLead}</p>
          <div className="lp-prose">
            {c.simonsBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>{c.rulesTitle}</h2>
          <div className="grid-3 lp-rules">
            {c.rules.map(([title, body]) => (
              <article key={title} className="feature">
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>{c.proofTitle}</h2>
          <p className="lead">{c.proofLead}</p>
          <div className="grid-3">
            {c.proofs.map(([title, body]) => (
              <article key={title} className="panel">
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section lp-stay">
          <h2>{c.stayTitle}</h2>
          <p>{c.stayBody}</p>
          <Link className="btn btn-primary" href="/register">
            {c.primary}
          </Link>
        </section>

        <footer className="lp-foot">
          <p>{c.disclaimer}</p>
        </footer>
      </div>
    </div>
  );
}
