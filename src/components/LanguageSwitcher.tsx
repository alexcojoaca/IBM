"use client";

import { LANGS, type LangCode } from "@/lib/langs";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact, className }: Props) {
  const { lang, setLanguage, t } = useI18n();

  return (
    <label className={className} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {!compact && (
        <span className="muted" style={{ fontSize: "0.8rem" }}>
          {t("common.language")}
        </span>
      )}
      <select
        value={lang}
        aria-label={t("common.language")}
        onChange={(e) => void setLanguage(e.target.value as LangCode)}
        style={{ minWidth: compact ? 72 : 140 }}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {compact ? l.code.toUpperCase() : l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
