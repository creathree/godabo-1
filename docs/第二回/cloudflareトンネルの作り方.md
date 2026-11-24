# Cloudflare トンネルの作り方

ローカルで動かしている Next.js を、**HTTPS の URL** から試すための手順です。  
なぜ Tunnel を第二回から入れるかは [Cloudflareについて](./Cloudflareについて.md) を先に読んでください。  
credentials や埋め済み config は Git に載せません（[ルールブック](./ルールブック.md)）。

---

## 1. 即席トンネル（いちばん手軽）

```bash
npm run dev          # 127.0.0.1:3000
npm run dev:tunnel   # 別ターミナル
# または npm run dev:full
```

### cloudflared のインストール（初回のみ）

**Windows**

```powershell
winget install --id Cloudflare.cloudflared
cloudflared --version
```

**macOS など**

[Cloudflare — Connect networks](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) を参照してください。

---

## 2. 名前付きトンネル（URL を固定したいとき）

### 手順の概要

1. `cloudflared tunnel login`
2. `cloudflared tunnel create godabo`
3. `cloudflared tunnel route dns godabo dev.example.com`
4. [`cloudflared/godabo-1.yml`](../../cloudflared/godabo-1.yml) をコピーし `<INPUT_…>` を埋める。**埋め済みファイルはリポ外**（例: `~/.cloudflared/`）に置く
5. `.env.local` に `CLOUDFLARED_CONFIG` / `CLOUDFLARED_TUNNEL_NAME`
6. `npm run dev:next` と `npm run dev:tunnel:named`

削除: `cloudflared tunnel delete godabo`（DNS・プロセスを先に確認）

---

## 3. 困ったとき

| 確認項目 | 内容 |
| --- | --- |
| トンネル名 | `tunnel list` の Name と `tunnel run` が一致 |
| credentials | `credentials-file` が正しい JSON |
| 転送先 | `http://127.0.0.1:3000` |
| DNS | CNAME が `<UUID>.cfargotunnel.com` |

---

## 4. 関連

- [Cloudflareについて](./Cloudflareについて.md)
- [第二回 README](./README.md)
- [使用する知識](./使用する知識.md)
- [ルート README](../../README.md)