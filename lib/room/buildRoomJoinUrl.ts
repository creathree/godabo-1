import { sanitizePublicRoomKey } from "@/lib/room/publicRoomKey";
import { getGodaboSiteOrigin } from "@/lib/siteUrls";

/** 参加用の通常 URL（QR もこれ）。`?k=` だけ載せ、スラグは載せない */
export function buildRoomJoinPageUrl(
  publicRoomKey: string,
  origin?: string,
): string | null {
  const k = sanitizePublicRoomKey(publicRoomKey);
  if (!k) return null;
  const base = (
    origin ??
    (typeof window !== "undefined"
      ? window.location.origin
      : getGodaboSiteOrigin())
  ).replace(/\/$/, "");
  if (!base) return null;
  const q = new URLSearchParams({ k });
  return `${base}/room/join?${q.toString()}`;
}