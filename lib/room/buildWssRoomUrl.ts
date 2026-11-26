import { sanitizePublicRoomKey } from "@/lib/room/publicRoomKey";
import { sanitizeRoomUserSlug } from "@/lib/room/slug";
import { getGodaboWssUrl } from "@/lib/wssUrl";

/** ブラウザが Worker に張る WSS URL（共有時は公開鍵 64hex を推奨） */
export function buildWssRoomUrl(roomSegment: string): string | null {
  const base = getGodaboWssUrl();
  if (!base) return null;
  const segment =
    sanitizePublicRoomKey(roomSegment) ??
    sanitizeRoomUserSlug(roomSegment);
  if (!segment) return null;
  const root = base.replace(/\/$/, "");
  return `${root}/room/${encodeURIComponent(segment)}`;
}