# 暫定 typeNo（メッセージ type）

第三回のチャットは **1 本の WebSocket** 上で JSON を送ります。フィールド名は `typeNo` ではなく **`type`（文字列）** ですが、連載では「種類番号」の意味で **typeNo** と呼びます。将来、数値 ID に移行してもよい **暫定表** です。

note にも同じ表を載せます。変更したら **このファイルと Worker・クライアントを同じ PR** で揃えます。

---

## クライアント → RoomHub（上り）

| type | 意味 | ペイロード（抜粋） | 実装 |
| --- | --- | --- | --- |
| **`say`** | 発言 | `text`（最大 500 文字）、`role`（例: `host` / `join`） | `useRoomWss` の `sendChat` |

送信例:

```json
{ "type": "say", "text": "こんにちは", "role": "host" }
```

`role` は 16 文字まで（DO 側で切り詰め）。不正 JSON の場合のみ、レガシーとして **生テキスト** をそのまま中継します（デモ用・徐々に廃止予定）。

---

## RoomHub → 全接続（下り）

| type | 意味 | ペイロード（抜粋） | 実装 |
| --- | --- | --- | --- |
| **`relay`** | ルーム内ブロードキャスト | `text`, `role`, `at`（UNIX ms） | `roomHub.ts` の `webSocketMessage` |

受信例:

```json
{ "type": "relay", "text": "こんにちは", "role": "host", "at": 1730000000000 }
```

クライアントは `type === "relay"` のみチャット欄に追加します（`hooks/useRoomWss.ts`）。

---

## 今後の type（未実装・メモ）

| type（案） | 用途 |
| --- | --- |
| `ping` / `pong` | キープアライブ（必要になったら） |
| `presence` | 接続数・ニックネーム（ユーザー数と切り離す） |
| `game` | 5W1H カード進行（第三回以降） |
| （暗号化本文・案） | サーバで暗号化した文字列を載せる type — 鍵は **KMS** 等で管理（→ [HMACとルーム鍵](./HMACとルーム鍵.md)） |

拡張するときは **type を足す** だけにせず、バージョンまたは `v` フィールドを検討します。

---

## 関連

- [WorkerとDurableObjects](./WorkerとDurableObjects.md)
- [WSS接続の構文](./WSS接続の構文.md)
- [第三回 README](./README.md)