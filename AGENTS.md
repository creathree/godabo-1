<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ゴダボーワン（godabo）

参加型 5W1H あそびのフロント。App Router + path locale。

## ルーティング

- ホスト例: `godabo-1.creathree.com`（パスに `godabo-1` は付けない）
- `/` → `/home`（locale プレフィックスは i18n 本実装まで入れない）
- 公開 locale: `ja`（正本）、`ko` のみ（Next 組み込み i18n は使わない）
- API: `app/api/**/route.ts`（空の `app/api/` から拡張）

## i18n（bracket-i18n）

- 設定: ルートの `i18n-config.js`
- ランタイム: `i18n/index.ts` の `Languages(id, locale)`
- 文案は原則 `[[日本語]]` → `npm run i18n:scan` → 一括翻訳は `npm run i18n:fill`（要 `GEMINI_API_KEY`）
- 大量追記時は `npm run i18n:pause` … `resume` → `scan`

## 開発

- `npm run dev` — ローカルのみ
- `npm run dev:full` / `dev:tunnel` — Tunnel（`.env.local` の `CLOUDFLARED_*` または即席 `--url`）

## デプロイ（GCP）

- `output: "standalone"` + ルート `Dockerfile`（ポート 8080）
- 水際: `middleware.ts`（Imaju-flash 同型・Upstash レート/ban・本番 CSP/HSTS）
- Upstash: `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`（未設定時は制限のみ無効）
- env テンプレ: `.env.example`（local）/ `.env.production.example`（本番棚卸し）。マスター秘密は `GODABO_MASTER_ID`（`lib/godaboMasterId.ts`）。Imaju の `CREATHREE_MASTER_ID` とは別値
- 手順: `docs/第四回/GCPデプロイ.md`

## 公開 Git

秘密・個人パスはコミットしない。`.gitignore` と `README.md` の「載せないもの」を正本とする。

日本語の説明書: `docs/第一回/`〜`docs/第四回/`。Room/WSS 正本は `docs/第三回/` と `workers/godotabo-room/`。索引は `docs/README.md`。