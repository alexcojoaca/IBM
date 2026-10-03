"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";
import { landingCopy } from "./landing-copy";

export default function HomePage() {
  const { lang } = useI18n();
  const c = landingCopy(lang);

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
          <p className="lp-eyes">{c.eyes}</p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/register">
              {c.primary}
            </Link>
            <Link className="btn" href="/login">
              {c.secondary}
            </Link>
          </div>
        </section>

        <section className="section">
          <h2>{c.botTitle}</h2>
          <p className="lead">{c.botLead}</p>
          <p className="lp-body">{c.botBody}</p>
          <div className="lp-cards">
            {c.botPoints.map(([title, body]) => (
              <article key={title}>
                <h2>{title}</h2>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section lp-desk">
          <p className="lp-kicker">{c.simonsKicker}</p>
          <h2>{c.simonsTitle}</h2>
          <div className="lp-prose">
            {c.simons.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>{c.whyTitle}</h2>
          <p className="lead">{c.whyLead}</p>
          <div className="lp-why">
            {c.why.map(([title, body], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section lp-close">
          <h2>{c.closeTitle}</h2>
          <p>{c.closeBody}</p>
          <p className="lp-eyes">{c.eyes}</p>
          <Link className="btn btn-primary" href="/register">
            {c.primary}
          </Link>
        </section>
      </div>
    </div>
  );
}
