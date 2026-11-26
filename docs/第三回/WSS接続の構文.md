# WSS 接続の構文

第三回の **「どう繋ぐか」** を、環境変数・URL・コードの順でまとめます。

---

## 1. 環境変数

| 変数 | 誰が読む | 意味 |
| --- | --- | --- |
| `NEXT_PUBLIC_GODABO_WSS_URL` | ブラウザ | Worker の **ベース**（末尾スラッシュなし推奨）例: `wss://127.0.0.1:8787` |
| `GODABO_MASTER_ID` | Next サーバー・Worker | HMAC 秘密（または Bearer 用） |
| `GODABO_ROOM_EPOCH` | Next サーバー・Worker | 論理キー世代（既定 `1`） |
| `GODABO_ROOM_HMAC_SECRET` | 任意 | HMAC 専用鍵（無ければ `GODABO_MASTER_ID` を使用） |

テンプレ: ルートの [`.env.example`](../../.env.example)。

---

## 2. WSS URL の形

```
{NEXT_PUBLIC_GODABO_WSS_URL}/room/{segment}
```

| `segment` | 誰が使う | 例 |
| --- | --- | --- |
| **64 桁 hex**（公開鍵） | 参加側・ホスト共有後 | `wss://host/room/a1b2…64文字` |
| **スラグ**（互換） | 開発・Worker が HMAC 再計算 | `wss://host/room/my-room` |

組み立て: `lib/room/buildWssRoomUrl.ts` → `buildWssRoomUrl(segment)`。

読み取り: `lib/wssUrl.ts` の `getGodaboWssUrl()`（未設定なら接続 state は `unconfigured`）。

---

## 3. ホスト側フロー（スラグ → 公開鍵 → WSS）

1. ユーザーがホームでルーム ID（スラグ）を決める
2. **Next API** `POST /api/room/public-key` に `{ "slug": "..." }`
3. サーバーが `resolveRoomDoName` で **64hex** を返す（秘密はサーバーだけ）
4. ブラウザが `new WebSocket(buildWssRoomUrl(publicKey))`

`fetchPublicRoomKey`（`lib/room/fetchPublicRoomKey.ts`）が API を呼びます。

---

## 4. 参加側フロー（`?k=` のみ）

1. QR / リンク: `https://{サイト}/room/join?k={64hex}`（[URLの設計](./URLの設計.md)）
2. `useRoomJoinQuery` が `k` を読み取る
3. `connectByPublicKey(k)` → そのまま `openSocket(k)`（API 不要）

---

## 5. ブラウザ構文（最小）

```ts
const ws = new WebSocket(roomUrl);

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "say", text: "hello", role: "join" }));
};

ws.onmessage = (ev) => {
  const data = JSON.parse(String(ev.data));
  if (data.type === "relay") {
    // chatLines に追加
  }
};

ws.close(1000, "client");
```

共有フック: `hooks/useRoomWss.ts`（ホーム `WssConnectionField`、参加 `RoomJoinView`）。

---

## 6. Worker 健全性

```
GET https://{worker}/health  → 200 ok
```

WebSocket 以外で `/room/...` に来た場合は **404** または **426 Expected WebSocket**（DO 側）。

---

## 関連

- [暫定typeNo](./暫定typeNo.md)
- [WorkerとDurableObjects](./WorkerとDurableObjects.md)
- [workers/godotabo-room/README.md](../../workers/godotabo-room/README.md)