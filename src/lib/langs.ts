export const LANGS = [
  { code: "en", label: "English" },
  { code: "ro", label: "Română" },
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pl", label: "Polski" },
  { code: "ru", label: "Русский" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];
