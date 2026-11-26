const SLUG_RE = /^[a-zA-Z0-9_-]{1,32}$/;

export function sanitizeRoomUserSlug(raw: string): string | null {
  const s = raw.trim();
  if (!s || !SLUG_RE.test(s)) return null;
  return s;
}

/** 勝手に割り当てない。ユーザーが「IDを生成」を押したときだけ使う */
export function generateRoomUserSlug(): string {
  const part = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `room-${part}`;
}

export {
  buildLogicalRoomKey,
  hmacRoomDoName,
  resolveRoomDoName,
} from "./roomKey";