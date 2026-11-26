import { sanitizeRoomUserSlug } from "@/lib/room/slug";
import { sanitizePublicRoomKey } from "@/lib/room/publicRoomKey";

/** ホスト用: 入力スラグを Next API 経由で公開鍵に変換（秘密はサーバーのみ） */
export async function fetchPublicRoomKey(
  userSlug: string,
): Promise<string | null> {
  const slug = sanitizeRoomUserSlug(userSlug);
  if (!slug) return null;

  const res = await fetch("/api/room/public-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });

  if (!res.ok) {
    console.warn("[godabo] /api/room/public-key failed", res.status);
    return null;
  }
  const data = (await res.json()) as { publicKey?: string };
  const key = sanitizePublicRoomKey(data.publicKey ?? "");
  if (!key) {
    console.warn("[godabo] /api/room/public-key invalid body");
  }
  return key;
}