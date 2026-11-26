# godabo-room Worker

ルームの常駐と WebSocket は **Next ではなく Worker + DO** で受けます。

- **公開鍵ルート（推奨）**: `wss://<host>/room/{64hex}` … URL の鍵がそのまま DO 名
- **スラグルート（互換）**: スラグ → 論理キー `apple_1@e1` → HMAC → DO 名
- 論理キーは `GODABO_ROOM_EPOCH` と秘密（`GODABO_ROOM_HMAC_SECRET` または `GODABO_MASTER_ID`）
- デモ: `ENABLE_ROOM_AUTH=false`（WSS に Bearer 不要）
- 荒れたら `wrangler.toml` の `ENABLE_ROOM_AUTH=true` と Next 側 Bearer 送信を足す

```bash
cd workers/godotabo-room
npm install
npx wrangler secret put GODABO_MASTER_ID
npm run dev
```

WSS ログ（本番）:

```bash
npx wrangler tail
```

`[godabo-room]` プレフィックス — `room.route.hit` → `room.do.stub` → `do.ws.accept` など。

`.env.local`:

```env
NEXT_PUBLIC_GODABO_WSS_URL=wss://localhost:8787
# またはデプロイ後 wss://godabo-room.<account>.workers.dev
```