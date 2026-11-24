# ゴダボーワン（godabo）

参加型「5W1Hあそび」のフロント。[note 連載](https://note.com/nana_nezumi/n/nf4c8147368ae) に沿って公開開発しています。

## リポジトリを見に来た方へ

[creathree](https://github.com/creathree) の **公開学習用リポジトリ** です（個人のメモ置き場ではありません）。現時点は **第二回 = 土台フェーズ** で、認証・Room 同期・本番デプロイはこれからです。

| 確認したいこと | どこを見るか |
| --- | --- |
| 何を作っているか | [第一回 — 趣旨](./docs/第一回/README.md) |
| いま何が入っているか | [第二回 README](./docs/第二回/README.md) |
| 秘密情報・コミット・デプロイ | [ルールブック](./docs/第二回/ルールブック.md) |
| 特定の回のスナップショット | Git タグ `note-第一回` / `note-第二回` |

秘密値はリポに含めません（`.env.example` と設定雛形のみ）。不具合・提案は GitHub の Issue / PR で受け付けます。

## ドキュメント（日本語）

[docs/README.md](./docs/README.md) に回ごとの一覧があります。

| 回 | 内容 |
| --- | --- |
| [第一回](./docs/第一回/README.md) | ゴダボーワンの趣旨（構想まとめ） |
| [第二回](./docs/第二回/README.md) | リポ土台・[使用する知識](./docs/第二回/使用する知識.md)・[Cloudflare](./docs/第二回/Cloudflareについて.md)・[Tunnel](./docs/第二回/cloudflareトンネルの作り方.md)・[ルールブック](./docs/第二回/ルールブック.md) |

- Next.js（App Router）+ Tailwind
- 公開 locale: `/ja/...`・`/ko/...`（`app/[locale]/`。Next 組み込み i18n は未使用）
- 多言語: [bracket-i18n](https://www.npmjs.com/package/bracket-i18n)
- Firebase / Redux Toolkit: `lib/firebase`・`lib/store`（雛形）

## 開発

```bash
npm install
npm run dev          # 127.0.0.1:3000 のみ
npm run dev:full     # + 即席 Cloudflare Tunnel（設定ファイル不要）
```

| コマンド | 用途 |
| --- | --- |
| `npm run dev:next` | ローカルのみ |
| `npm run dev:tunnel` | `cloudflared tunnel --url http://127.0.0.1:3000` |
| `npm run dev:tunnel:named` | `.env.local` の `CLOUDFLARED_*` で永続トンネル |
| `npm run i18n:scan` | `[[…]]` をカタログ化（Gemini 不要） |
| `npm run i18n:fill` | 要 `GEMINI_API_KEY`（後で一括でも可） |

## 公開 Git・env・デプロイ

**[第二回 — ルールブック](./docs/第二回/ルールブック.md)** にまとめています（`.gitignore` の意味、コミット前チェック、デプロイ時の秘密の置き場所など）。

要約: 秘密は `.env.local` とホスティングの Secret のみ。リポには `.env.example` と雛形だけ。

`AGENTS.md` はエージェント向けの短い要約です。