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