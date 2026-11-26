# WSS について（特徴・メリット・デメリット・対策）

第三回で **ブラウザ ↔ Cloudflare Worker** の通信に **WSS**（WebSocket over TLS）を採用しました。note ではストーリーと図、ここでは判断の整理です。

---

## WSS とは（ざっくり）

- **HTTP と同じ TLS 上** で、一度つながったら **双方向** にフレームを送り続ける
- ブラウザ標準の `WebSocket` API で使える（追加プラグイン不要）
- ゴダボでは **Next.js には載せず**、Worker エンドポイントに直接接続する（[構文](./WSS接続の構文.md)）

---

## メリット（ゴダボで効くところ）

| 点 | 内容 |
| --- | --- |
| **低遅延** | ポーリングより、チャット・進行通知向き |
| **シンプルなクライアント** | `new WebSocket(url)` と `send` / `onmessage` |
| **エッジ入口** | Worker が世界中の PoP で受け、DO に渡せる |
| **参加体験** | QR → 参加 URL → 自動接続（Imaju Flash の wss 体験に近い） |

---

## デメリット・注意点

| 点 | 内容 |
| --- | --- |
| **接続は状態ful** | プロキシ・タブ休眠・モバイル回線で切れやすい |
| **スケールの考え方** | 「1 接続 = 1 ユーザー」とは限らない（→ [WorkerとDO](./WorkerとDurableObjects.md)） |
| **運用** | Worker / DO の別デプロイ、CSP の `connect-src` に `wss://` が必要 |
| **認証** | 第三回はデモ優先（`ENABLE_ROOM_AUTH=false`）。荒れたら Bearer |

---

## 対策（このリポで入れている・これから）

| 課題 | 対策 |
| --- | --- |
| Worker に届かない | `NEXT_PUBLIC_GODABO_WSS_URL` の確認、`wrangler dev` / 本番ホストの一致 |
| CSP でブロック | `middleware.ts` の `connect-src` に Worker ドメイン（`wss://*.workers.dev` 等） |
| 鍵の推測 | スラグを配布 URL に載せず **`?k=` = HMAC 64hex**（[HMACとルーム鍵](./HMACとルーム鍵.md)） |
| 切断・再接続 | 第四回以降で UI とプロトコル強化（現状は手動再接続） |
| 本番の荒らし | `ENABLE_ROOM_AUTH` + `GODABO_MASTER_ID` Bearer（Worker README） |
| 観測 | `wrangler tail` と `wssLog`（`room.route.hit` → `do.ws.accept`） |

---

## なぜ Room を Next の Route Handler にしないか

- **長寿命接続** は Node / Cloud Run の 1 リクエストモデルと相性が悪い
- **ルーム単位のメモリ** を **Durable Object** に閉じ込めたい
- フロントは静的配信（GCP）・リアルタイムは Cloudflare、という **役割分担**

---

## 関連

- [WSS接続の構文](./WSS接続の構文.md)
- [WorkerとDurableObjects](./WorkerとDurableObjects.md)
- [第二回 — Cloudflareについて](../第二回/Cloudflareについて.md)