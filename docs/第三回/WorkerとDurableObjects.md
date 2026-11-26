# Worker と Durable Objects

第三回の **WSS 入口** は Cloudflare **Worker**、**ルームの中身** は **Durable Object（`RoomHub`）** です。note でも「Response の書き方」と「接続数の数え方」を扱います。ここはコードと同じ語彙で整理します。

---

## 役割分担

```text
ブラウザ ──WSS──► Worker (workers/godotabo-room/src/index.ts)
                      │
                      ├─ /health → 200 plain text
                      └─ /room/{segment} → resolveRoomHub → DO.fetch(upgrade)
                                                      │
                                                      └─ RoomHub (DO)
                                                           acceptWebSocket
                                                           broadcast relay
```

| 層 | ファイル | やること |
| --- | --- | --- |
| **Worker** | `index.ts` | パース、認証（任意）、**どの DO に渡すか**、`hub.fetch(request)` |
| **DO** | `roomHub.ts` | WebSocket 昇格、メッセージ中継、ルーム内全員へ `send` |

---

## Worker の Response の書き方

### 通常 HTTP

```ts
return new Response("ok", {
  headers: { "content-type": "text/plain; charset=utf-8" },
});
```

`404 Not Found`（パス不正）、`401 Unauthorized`（Bearer 不一致）、`503 Room unavailable`（鍵解決失敗）。

### WebSocket へ渡す（本体は DO）

Worker は **自分で 101 を組み立てません**。`await hub.fetch(request)` の戻り値をそのまま返します。DO 側が **101 Switching Protocols** を返します。

Worker ログ例: `room.route.hit` → `room.do.stub` → `room.upgrade.response`（`status: 101`）。

---

## Durable Object（RoomHub）の Response

`Upgrade: websocket` ヘッダがあるときだけ昇格します。

```ts
const pair = new WebSocketPair();
const client = pair[0];
const server = pair[1];

this.state.acceptWebSocket(server);

return new Response(null, { status: 101, webSocket: client });
```

- **`client`**: ブラウザ側に返るソケット（Response に載せる）
- **`server`**: DO が `webSocketMessage` で受け取る側

`Upgrade` が無い場合は **426** `Expected WebSocket`。

---

## DO 名の決め方（どのルームか）

`env.ROOM_HUB.idFromName(doName)` → **同じ名前なら常に同じ DO インスタンス**。

| 経路 | `doName` |
| --- | --- |
| 公開鍵 URL | 64hex を **そのまま** DO 名 |
| スラグ URL | `resolveRoomDoName(slug, env)` で HMAC 計算 |

→ [HMACとルーム鍵](./HMACとルーム鍵.md)

---

## 「接続数 ≠ ユーザー数」ではない理由

Dashboard やログの **WebSocket 接続数** をそのまま「参加者数」と読むとズレます。

| 要因 | 説明 |
| --- | --- |
| **1 人・複数タブ** | 同じ人がホームと参加を開くと **接続は 2** |
| **再接続** | 切断→再接続で **古いソケットと新しいソケット** が短時間共存しうる |
| **ホスト＋参加者** | デモチャットでは各端末が **1 接続** — 役割は `role` フィールドだけ |
| **将来** | `presence` type で「人」を数える想定（[暫定typeNo](./暫定typeNo.md)） |

第三回のチャットは **「同じ DO に刺さっているソケット同士が relay する」** モデルです。ユーザー ID や Firebase とはまだ結びません。

**ゲームの正本**は「接続」ではなく、これから載せる **Room 状態（DO ストレージ / Firestore 等）** に寄せる予定です。

---

## メッセージ処理（DO）

`webSocketMessage` → `type: say` を検証 → 全 `getWebSockets()` に `type: relay` を `send`。

自分の発言も relay で返る（エコー確認しやすいデモ仕様）。

---

## 関連

- [WSS接続の構文](./WSS接続の構文.md)
- [WSSについて](./WSSについて.md)
- `workers/godotabo-room/src/index.ts` / `roomHub.ts`