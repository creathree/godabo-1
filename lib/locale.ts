export const DEFAULT_LOCALE = "ja" as const;

/** 公開面と揃え ja / ko（第二回以降で本格利用） */
export const LOCALES = ["ja", "ko"] as const;

export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function getIndexLocale(): Locale {
  return DEFAULT_LOCALE;
}

/** Accept-Language → 公開 locale（ko のみ拾う。それ以外は ja） */
export function localeFromAcceptLanguage(
  header: string | null,
): Locale {
  const raw = header ?? "";
  const first = raw.split(",")[0]?.trim() ?? "";
  const lang = first.split("-")[0]?.trim().toLowerCase() ?? "";
  if (lang === "ko" || lang.startsWith("ko")) return "ko";
  if (isLocale(lang)) return lang;
  return DEFAULT_LOCALE;
}