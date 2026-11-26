# HMAC とルーム鍵

第三回の **参加 URL (`?k=`)** と **WSS パス** に載る **64 桁 hex** は、スラグそのものではなく **HMAC-SHA256** の結果です。note では暗号のイメージ図を載せ、ここでは **式と実装** を正本にします。

---

## 何を守りたいか

| 目的 | 説明 |
| --- | --- |
| **推測されにくい URL** | `room-apple` のような人間のスラグを QR に載せない |
| **同じスラグでも世代を切れる** | `GODABO_ROOM_EPOCH` を上げると別ルームになる |
| **サーバーだけが秘密を持つ** | HMAC **鍵**はブラウザに渡さない（API が hex だけ返す） |

**HMAC は「暗号化」ではありません。** ルーム ID を **署名** して、秘密鍵なしでは同じ hex を作れないようにしています。ルーム名そのものは論理キーに含まれますが、URL から **スラグを復元** はできません（鍵なし）。

---

## 論理キー（署名対象の文字列）

```
{userSlug}@e{epoch}
```

例: スラグ `apple`、`GODABO_ROOM_EPOCH=1` → `apple@e1`

実装: `lib/room/roomKey.ts` の `buildLogicalRoomKey`。

---

## HMAC-SHA256 → DO 名 / 公開鍵

1. 秘密 `secret` を決める（優先順）  
   - `GODABO_ROOM_HMAC_SECRET`（あれば）  
   - なければ `GODABO_MASTER_ID`
2. `crypto.subtle.sign("HMAC", key, logicalKey)`（Web Crypto）
3. 結果を **hex 64 文字**（小文字）にする → **公開ルーム鍵**

同じ式を **Next API**（`resolveRoomDoName`）と **Worker**（スラグ経路）で共有します。片方だけ epoch や秘密が違うと **別ルーム** になります。

---

## 検証ルール（受け口）

公開鍵は `^[a-f0-9]{64}$` のみ許可: `lib/room/publicRoomKey.ts` の `sanitizePublicRoomKey`。

---

## Worker では二つの入口

| URL パス | DO 名の決め方 |
| --- | --- |
| `/room/{64hex}` | hex を **そのまま** `idFromName` |
| `/room/{slug}` | 上記 HMAC をその場で計算 |

本番共有は **hex 経路のみ**（参加 URL は `?k=`）。スラグ経路は開発・互換用です。

---

## 秘密の置き場

| 場所 | 変数 |
| --- | --- |
| Next `.env.local` | `GODABO_MASTER_ID`, `GODABO_ROOM_EPOCH`, 任意 `GODABO_ROOM_HMAC_SECRET` |
| Worker | `wrangler secret put GODABO_MASTER_ID`、環境変数 epoch は `wrangler.toml` 等 |

**Git に載せない**（[ルールブック](../第二回/ルールブック.md)）。

---

## 将来の Bearer との関係

`ENABLE_ROOM_AUTH=true` のとき、Worker は `Authorization: Bearer {GODABO_MASTER_ID}` を要求できます。  
**HMAC 鍵**と **接続認証**は別レイヤーです（第三回デモでは通常オフ）。

---

## レイヤーの整理（HMAC とペイロード暗号）

| レイヤー | 第三回 | 役割 |
| --- | --- | --- |
| **ルーム鍵（HMAC）** | 実装済み | URL / DO 名の導出・推測困難化 |
| **WSS（TLS）** | 実装済み | 輸送路の暗号化 |
| **本文（チャット文字列）** | **平文 JSON**（`say` / `relay`） | デモ用。同一 DO 内ブロードキャスト |

ゲーム本編など **文字列のやりとりをサーバ側で保護** する段階では、**ペイロードの暗号化・鍵管理** を足す方針です。候補として **クラウド KMS**（GCP Cloud KMS やマネージド鍵）でデータ鍵を扱い、Worker / Next / Run の **サーバーだけ** が復号する形を想定しています（note でも具体化）。

- **HMAC 秘密**と **メッセージ暗号鍵**は分けます（用途とローテーションが違う）。
- ブラウザに復号鍵を常駐させない前提を維持しやすい設計を優先します。
- 第三回の `relay.text` はそのまま残し、暗号化版 type またはフィールドを **追加** する形で連載を進める予定です。
- 実装の範囲は **保護が必要なフィールドから段階的に** 広げます（note / 連載で具体化）。

---

## 関連

- [URLの設計](./URLの設計.md)
- [WSS接続の構文](./WSS接続の構文.md)
- [WorkerとDurableObjects](./WorkerとDurableObjects.md)