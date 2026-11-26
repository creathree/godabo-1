# 第四回 — GCP（Cloud Run）デモ公開

張りぼての現状をそのまま視聴者向けに載せる手順です。Firebase 等は未接続のまま。**本番のレート制限/ban には Upstash 2 変数が必要**（無くても起動はする）。

## 前提

- GCP プロジェクト作成済み
- `gcloud` CLI ログイン済み
- Artifact Registry / Cloud Run API 有効

## 1. ローカルで Docker 確認

```bash
npm run docker:build
npm run docker:run
# http://127.0.0.1:8080/home
```

## 2. Cloud Build でデプロイ

```bash
gcloud config set project YOUR_PROJECT_ID
# PowerShell: カンマは配列になるのでクォート必須
gcloud builds submit --config cloudbuild.yaml `
  --substitutions="_REGION=asia-northeast1,_SERVICE=godabo"
```

初回は Container Registry / Cloud Run の権限をサービスアカウントに付与してください。

### Upstash（middleware・Imaju と同じ変数名）

1. Secret Manager に **秘密名＝環境変数名** で作成する  
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`（値は Upstash コンソールの REST）
2. Cloud Run の実行 SA に `secretAccessor` を付与
3. `cloudbuild.yaml` の `gcloud run deploy` は `--set-secrets` で上記を **実行時注入**（`npm run build` には入れない）

ローカル本番確認: `docker run -e UPSTASH_REDIS_REST_URL=... -e UPSTASH_REDIS_REST_TOKEN=... ...`

## 3. セキュリティ（実装済み）

- `middleware.ts` … Imaju-flash 水際（probe 404・Upstash レート/ban・`/`→`/home`）
- 本番のみ CSP / HSTS 等（dev は HMR のため付けない）
- `middleware.ts` は起動時に `Redis.fromEnv()` → 上記 2 名を読む（Imaju-flash 同型）

本番で Firebase / 外部 API を足したら CSP を更新します。

## 4. 今後の秘密

`.env.local` や Cloud Run の **Secrets** は第三回ルールのとおり。現時点でデプロイ本線の秘密は Upstash の 2 つのみ。