/** ブラウザから接続する WSS の正本（未設定時は接続確認 UI が unconfigured） */
export function getGodaboWssUrl(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_GODABO_WSS_URL?.trim();
  if (!fromEnv) return null;
  if (!fromEnv.startsWith("wss://") && !fromEnv.startsWith("ws://")) {
    return null;
  }
  const normalized = fromEnv.replace(/\/$/, "");
  try {
    const u = new URL(normalized);
    if (/\s/.test(u.hostname)) return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}