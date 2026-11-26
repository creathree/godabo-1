/**
 * godabo 固有のマスター秘密（Imaju の CREATHREE_MASTER_ID 相当）。
 * サーバー専用 — Client から import しない。
 */
export function getGodaboMasterId(): string | null {
  const id = process.env.GODABO_MASTER_ID?.trim();
  return id || null;
}

export function requireGodaboMasterId(): string {
  const id = getGodaboMasterId();
  if (!id) {
    throw new Error("GODABO_MASTER_ID not configured");
  }
  return id;
}