"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LANGS, type LangCode } from "@/lib/langs";
import { translate } from "@/i18n/dict";
import { createClient } from "@/lib/supabase/client";

type Ctx = {
  lang: LangCode;
  setLanguage: (code: LangCode, persistProfile?: boolean) => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
  ready: boolean;
};

const LanguageContext = createContext<Ctx | null>(null);

function isLang(v: string | null | undefined): v is LangCode {
  return !!v && LANGS.some((l) => l.code === v);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next: LangCode = "en";
      try {
        const stored = localStorage.getItem("ibm_language");
        if (isLang(stored)) next = stored;
      } catch {
        /* ignore */
      }
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("preferred_language")
            .eq("id", user.id)
            .maybeSingle();
          if (isLang(data?.preferred_language)) next = data.preferred_language;
        }
      } catch {
        /* ignore — guest / missing env */
      }
      if (!cancelled) {
        setLang(next);
        try {
          localStorage.setItem("ibm_language", next);
        } catch {
          /* ignore */
        }
        document.documentElement.lang = next;
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (code: LangCode, persistProfile = true) => {
    setLang(code);
    document.documentElement.lang = code;
    try {
      localStorage.setItem("ibm_language", code);
    } catch {
      /* ignore */
    }
    if (!persistProfile) return;
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ preferred_language: code }).eq("id", user.id);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );

  const value = useMemo(() => ({ lang, setLanguage, t, ready }), [lang, setLanguage, t, ready]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}
