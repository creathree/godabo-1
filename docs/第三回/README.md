# 第三回 — Room / WSS（チャットルーム完成）

note 第三回に対応します。詳しい背景や図解は **note 本文** に任せ、このフォルダは **リポジトリの正本**（実装と同じ用語・URL・構文）です。

---

## 第三回で到達したこと

- **ホーム**でルーム作成（接続）→ **QR / 参加 URL** を共有
- **参加画面**（`/room/join?k=`）で自動 WSS 接続
- **ホスト ↔ 参加** の簡易テキストチャット（同一ルーム内ブロードキャスト）
- リアルタイム通信は **Cloudflare Worker + Durable Object**（Next の API ルートではない）

このチャットルームを、第三回以降の **ゲーム進行・同時視聴の通信基盤** として積み上げていきます。

---

## このフォルダの資料

| 資料 | 内容 |
| --- | --- |
| **本ファイル** | スコープと開発の起動方法 |
| [暫定typeNo.md](./暫定typeNo.md) | フレーム JSON の `type`（いまの番号表） |
| [WSSについて.md](./WSSについて.md) | WSS の特徴・メリット・デメリット・対策 |
| [WSS接続の構文.md](./WSS接続の構文.md) | ブラウザ・環境変数・接続フロー |
| [WorkerとDurableObjects.md](./WorkerとDurableObjects.md) | Worker の Response・DO・**接続数 ≠ ユーザー数** |
| [HMACとルーム鍵.md](./HMACとルーム鍵.md) | 公開鍵の作り方（HMAC-SHA256） |
| [URLの設計.md](./URLの設計.md) | 参加 URL・WSS パス・いまの形 |
| [note下書き.md](./note下書き.md) | **note 第三回** 投稿用下書き |

実装の正本: `workers/godotabo-room/`、`hooks/useRoomWss.ts`、`lib/room/`。

---

## 第三回のスコープ（このリポでやったこと）

| 項目 | 内容 |
| --- | --- |
| 通信 | **WSS**（ブラウザ ↔ Worker） |
| ルーム状態 | **Durable Object**（`RoomHub`）1 ルーム = 1 DO |
| プロトコル | JSON、`type: say` → 配信 `type: relay`（[暫定typeNo](./暫定typeNo.md)） |
| 鍵 | 論理キー `slug@e{epoch}` の **HMAC** → 64hex（共有は `?k=` のみ推奨） |
| フロント | `useRoomWss`、ホーム接続 UI、参加ビュー、チャットパネル |

---

## 第三回のスコープ外（第四回以降）

- GCP 本番・Cloud Run 常時公開（→ [第四回](../第四回/GCPデプロイ.md)）
- Firebase ログインと参加者の本人性
- ゲーム用の権限・途中退出・再接続の厳密設計
- メッセージ type の大幅拡張（現状はチャット最小）

---

## ローカル開発

### Next（画面・`/api/room/public-key`）

```bash
npm install
npm run dev
```

`http://127.0.0.1:3000/home` — `.env.local` に少なくとも:

```env
NEXT_PUBLIC_GODABO_WSS_URL=wss://127.0.0.1:8787
GODABO_MASTER_ID=…          # Worker と同じ値（HMAC 用）
GODABO_ROOM_EPOCH=1
```

### Worker（WSS 本体）

```bash
cd workers/godotabo-room
npm install
npx wrangler secret put GODABO_MASTER_ID   # 初回
npm run dev
```

ブラウザの WSS は **Next ではなく Worker** へ直結します。詳細は [workers/godotabo-room/README.md](../../workers/godotabo-room/README.md)。

---

## 次に読む

- [暫定typeNo](./暫定typeNo.md) → [WSSについて](./WSSについて.md) → [構文](./WSS接続の構文.md)
- [第二回 — ルールブック](../第二回/ルールブック.md)（秘密鍵は Git に載せない）
- [説明書一覧](../README.md)