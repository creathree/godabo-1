# URL の設計（第三回時点）

note でも「いまの URL」を説明します。第三回で **実際に配っている形** を固定メモします。

---

## サイト（Next）— 人がクリックする URL

| 用途 | パス | クエリ |
| --- | --- | --- |
| ホスト（接続・QR 作成） | `/home` | なし（ルーム作成は画面操作） |
| 参加 | `/room/join` | **`k={64hex}`** のみ（スラグは載せない） |

参加 URL の組み立て: `lib/room/buildRoomJoinUrl.ts` → `buildRoomJoinPageUrl(publicKey)`。

例:

```text
https://godabo-1.creathree.com/room/join?k=3f8a…（64文字）
```

ローカル:

```text
http://127.0.0.1:3000/room/join?k=…
```

`NEXT_PUBLIC_SITE_URL` は本番・QR の origin 用（`.env.example` 参照）。

---

## WSS（Worker）— ブラウザが `WebSocket` で開く URL

```text
{NEXT_PUBLIC_GODABO_WSS_URL}/room/{segment}
```

| 誰 | 使う `segment` |
| --- | --- |
| 参加（推奨） | `k` と同じ **64hex** |
| ホスト（接続後） | API が返した **publicKey**（中身は同じ hex） |
| 互換 | スラグ（Worker が HMAC） |

例:

```text
wss://godabo-room.<account>.workers.dev/room/3f8a…
```

ローカル Worker:

```text
wss://127.0.0.1:8787/room/3f8a…
```

組み立て: `buildWssRoomUrl`（[WSS接続の構文](./WSS接続の構文.md)）。

---

## なぜ参加 URL と WSS URL を分けるか

| | HTTPS（Next） | WSS（Worker） |
| --- | --- | --- |
| 役割 | 画面・QR・SEO・middleware | リアルタイム中継 |
| ホスト | GCP / ローカル :3000 | Cloudflare Worker |
| 共有 | **`?k=`** だけで十分 | ブラウザが内部で組み立て |

参加者は **QR の HTTPS** だけ見ればよく、WSS のホスト名は実装詳細です（CSP で許可リストが必要）。

---

## API（ホスト専用）

```http
POST /api/room/public-key
Content-Type: application/json

{ "slug": "my-room" }
```

```json
{ "publicKey": "64hex…" }
```

秘密鍵はレスポンスに含みません。

---

## 第二回との違い

- 第二回: `/ja/home` など **locale パス**（土台）
- 第三回: **`/home` と `/room/join`** を中心に Room。locale は i18n 本実装と並行予定

---

## 関連

- [HMACとルーム鍵](./HMACとルーム鍵.md)
- [第三回 README](./README.md)
- [第四回 — GCPデプロイ](../第四回/GCPデプロイ.md)（本番の公開 URL）