/**
 * 共有 URL / WSS に載せる「公開ルーム鍵」（中身は HMAC-SHA256 の hex）。
 * スラグ `room-xxxx` をそのまま配らず、推測しにくい鍵だけを渡すための型と検証。
 */
export const PUBLIC_ROOM_DO_NAME_RE = /^[a-f0-9]{64}$/;

export function sanitizePublicRoomKey(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!PUBLIC_ROOM_DO_NAME_RE.test(s)) return null;
  return s;
}