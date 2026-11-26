const KEY = "godabo:roomUserSlug";

export function readRoomUserSlugFromSession(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const v = sessionStorage.getItem(KEY)?.trim();
  return v || null;
}

export function writeRoomUserSlugToSession(slug: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(KEY, slug);
}

export function clearRoomUserSlugSession(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(KEY);
}