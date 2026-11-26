/** ユーザーが付ける公開用スラグ（ブラウザ・SessionStorage に載せる） */
export type RoomUserSlug = string;

/** HMAC-SHA256(hex) — 共有 URL・WSS パス用。スラグはホスト管理用のみ */
export type RoomPublicKey = string;