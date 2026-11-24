/**
 * [[i18n]] Runtime Hub
 * This file is automatically updated by bracket-i18n.
 */
// @ts-ignore bracket-i18n CLI が part を追記するまで
import { translations as part1 } from "./data/part1";

const allData: Record<string, unknown> = {
  ...part1,
};

type LanguagesParams = {
  count?: number;
  gender?: string;
  select?: string;
};

const SOURCE_LOCALE = "ja";

function normalizeLocale(locale: string): string {
  const base = (locale || "ja").toLowerCase().split("-")[0];
  if (base === "jp") return "ja";
  return base;
}

function resolveCell(
  value: unknown,
  _params: LanguagesParams | undefined,
  _locale: string,
): string {
  if (typeof value === "string") return value;
  return "";
}

export const Languages = (
  id: string,
  locale: string,
  params?: LanguagesParams,
): string => {
  try {
    if (!id) return "";
    const targetLocale = normalizeLocale(locale);
    const entry = allData[id] as Record<string, unknown> | undefined;
    if (!entry) return "";
    const primary = resolveCell(entry[targetLocale], params, targetLocale);
    if (primary) return primary;
    const source = resolveCell(entry[SOURCE_LOCALE], params, SOURCE_LOCALE);
    if (source) return source;
    return resolveCell(entry.ko, params, "ko");
  } catch (error) {
    console.error(`[bracket-i18n] Error fetching ID: ${id}`, error);
    return "";
  }
};