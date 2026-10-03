"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="shell">
      <div className="container">
        <header className="nav">
          <div className="brand">
            IBM <span>●</span>
          </div>
          <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LanguageSwitcher compact />
            <Link className="btn" href="/login">
              {t("nav.login")}
            </Link>
            <Link className="btn btn-primary" href="/register">
              {t("nav.getStarted")}
            </Link>
          </div>
        </header>

        <section className="hero">
          <div className="brand" style={{ fontSize: "2.4rem" }}>
            IBM
          </div>
          <p className="muted" style={{ letterSpacing: "0.04em", marginTop: "-0.35rem" }}>
            {t("brand.tagline")}
          </p>
          <h1>{t("home.hero")}</h1>
          <p>{t("home.lead")}</p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/register">
              {t("home.createAccount")}
            </Link>
            <Link className="btn" href="/login">
              {t("home.haveAccount")}
            </Link>
          </div>
        </section>

        <section className="section">
          <h2>{t("home.how")}</h2>
          <p className="lead">{t("home.howLead")}</p>
          <div className="grid-3">
            <div className="feature">
              <h3>{t("home.step1")}</h3>
              <p>{t("home.step1Body")}</p>
            </div>
            <div className="feature">
              <h3>{t("home.step2")}</h3>
              <p>{t("home.step2Body")}</p>
            </div>
            <div className="feature">
              <h3>{t("home.step3")}</h3>
              <p>{t("home.step3Body")}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
