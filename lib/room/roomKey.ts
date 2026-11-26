/**
 * ルームを「論理名 → DO 名」に変換する共通ロジック（Next API と Worker で同じ式）。
 *
 * - 論理キー: あなたが付けたスラグ + 世代（例: `apple_1@e1`）
 * - 共有用の公開鍵: その論理キーを HMAC した 64 桁 hex（URL の `?k=`）
 * - Worker: 公開鍵をそのまま DO 名にできる（スラグを URL に出さない）
 */
export function buildLogicalRoomKey(
  userSlug: string,
  epoch: string | number = 1,
): string {
  const e = String(epoch).trim() || "1";
  return `${userSlug}@e${e}`;
}

export function roomHmacSecret(env: {
  GODABO_ROOM_HMAC_SECRET?: string;
  GODABO_MASTER_ID?: string;
}): string | null {
  const dedicated = env.GODABO_ROOM_HMAC_SECRET?.trim();
  if (dedicated) return dedicated;
  const master = env.GODABO_MASTER_ID?.trim();
  return master || null;
}

export async function hmacRoomDoName(
  logicalKey: string,
  secret: string,
): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(logicalKey));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function resolveRoomDoName(
  userSlug: string,
  env: {
    GODABO_ROOM_EPOCH?: string;
    GODABO_ROOM_HMAC_SECRET?: string;
    GODABO_MASTER_ID?: string;
  },
): Promise<string> {
  const epoch = env.GODABO_ROOM_EPOCH?.trim() || "1";
  const secret = roomHmacSecret(env);
  if (!secret) {
    throw new Error("room HMAC secret not configured");
  }
  const logical = buildLogicalRoomKey(userSlug, epoch);
  return hmacRoomDoName(logical, secret);
}