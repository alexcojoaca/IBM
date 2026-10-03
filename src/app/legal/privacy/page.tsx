"use client";

import Doc from "../Doc";
import { LEGAL } from "../content";
import { useI18n } from "@/i18n/LanguageProvider";

export default function PrivacyPage() {
  const { lang } = useI18n();
  const pack = lang === "ro" ? LEGAL.ro : LEGAL.en;
  return <Doc title={pack.privacyTitle} blocks={pack.privacy} />;
}
