/** 公開サイト URL の正本。デプロイ時は NEXT_PUBLIC_* で上書きする */

const GODABO_SITE_DEFAULT = "https://godabo-1.creathree.com";

const DEFAULTS = {
  creathree: "https://creathree.com",
  imaju: "https://imaju.creathree.com",
  creathreeX: "https://x.com/creathree",
} as const;

/** Room 参加リンクの origin（未設定時は本番想定ドメイン） */
export function getGodaboSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (fromEnv || GODABO_SITE_DEFAULT).replace(/\/$/, "");
}

export function getCreathreeUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CREATHREE_URL?.trim();
  return (fromEnv || DEFAULTS.creathree).replace(/\/$/, "");
}

export function getImajuUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_IMAJU_URL?.trim();
  return (fromEnv || DEFAULTS.imaju).replace(/\/$/, "");
}

/** creathree の X プロフィール */
export function getCreathreeXProfileUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CREATHREE_X_URL?.trim();
  return (fromEnv || DEFAULTS.creathreeX).replace(/\/$/, "");
}