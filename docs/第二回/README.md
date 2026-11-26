# 第二回 — リポジトリの土台

note 第二回の趣旨（ドメイン・Cloudflare Tunnel・React / Next.js / TypeScript / 型 / State / Redux の紹介と Git リポ作成）に対応する、**このリポジトリに実際に入っているもの** を説明します。

企画の背景は [第一回 — ゴダボーワンの趣旨](../第一回/README.md) と [note](https://note.com/nana_nezumi/n/nf4c8147368ae) を参照してください。

---

## このフォルダの資料

| 資料 | 内容 |
| --- | --- |
| **本ファイル（README）** | 第二回時点のスコープとディレクトリ |
| [使用する知識.md](./使用する知識.md) | TypeScript / React / Next.js / 型 / State / Redux の初心者向け地図 |
| [Cloudflareについて.md](./Cloudflareについて.md) | なぜ Cloudflare か・Tunnel で開発を本番に近づける考え方 |
| [cloudflareトンネルの作り方.md](./cloudflareトンネルの作り方.md) | 即席・永続トンネルの手順 |
| [ルールブック.md](./ルールブック.md) | Git / `.env` / デプロイ（公開リポ向け） |

実装の正本はコードと `AGENTS.md` です。

---

## 第二回のスコープ（このリポでやること）

| 項目 | 内容 |
| --- | --- |
| フレームワーク | Next.js（**App Router**） |
| スタイル | Tailwind（`create-next-app` 標準構成） |
| ルーティング | `/` → `/{locale}/home` |
| 多言語（URL） | `ja` 正本・`ko` のみ（path 方式） |
| 文言の仕組み | bracket-i18n を導入（UI の `[[…]]` 化は時期を見て可・`i18n:pause` 可） |
| 水際 | ルートの `middleware.ts`（locale 大小の正規化・基本セキュリティヘッダー） |
| 開発時の公開 | Cloudflare Tunnel → [背景](./Cloudflareについて.md)・[手順](./cloudflareトンネルの作り方.md) |

画面は **home で Hello World** まで。

開発者は Tunnel で **不定期に窓を開け**、そのときだけ HTTPS の URL で試せます（常時ステージングは必須ではありません）。詳しくは [Cloudflareについて](./Cloudflareについて.md)。

---

## 第二回のスコープ外（後の回）

- Google ログイン・Firestore・Room 同期
- Worker + DO + WSS（→ [第三回](../第三回/README.md)）
- R2
- TTS・めくり演出
- Redux（[使用する知識](./使用する知識.md)）
- 本番向けレート制限（Upstash 等）

---

## ディレクトリの要点

```
app/page.tsx                     … `/` → `/{locale}/home` へリダイレクト
app/[locale]/home/               … トップ
lib/locale.ts                    … 公開 locale（ja / ko）
middleware.ts                    … 水際
i18n/                            … bracket-i18n ランタイム
public/images/                   … 5W1H 用ビジュアル（配信パスは `/images/...`）
```

---

## ローカル開発

```bash
npm install
npm run dev
```

`http://127.0.0.1:3000` → `/ja/home` または `/ko/home`。

---

## 公開リポジトリ

[creathree](https://github.com/creathree) 公開前提。[ルールブック](./ルールブック.md) に従います。

---

## これから使うビジュアル（`public/`）

第二回はまだ **Hello World** ですが、リポの **`public/`** には、これから画面に載せていく **画像の置き場** がすでにあります。Next.js では `public` 以下がそのまま URL の根になります（例: `public/images/title_ja.png` → `/images/title_ja.png`）。ビルド成果物と一緒に配信されるので、Tunnel で窓を開けたときも **本番と同じパス** で見えます。

| 場所（例） | イメージ |
| --- | --- |
| `public/images/title_ja.png` / `title_ko.png` | 言語ごとのタイトル |
| `public/images/back.jpeg` | 背景の土台 |
| `public/images/asset/1_when/` 〜 `6_how/` | **5W1H** ごとのカード・小物用イラスト（`1_when`・`2_where`・`3_who` …） |

note 第一回で描いた **カードをめくる・一同鑑賞** の世界観は、コードが追いつく前からここに少しずつ溜まっていきます。  
次の回以降は、この `public/images` を React コンポーネントから参照しながら、ロケール別の見た目やめくり演出へつないんでいきます——**絵はもう届いている。あとは画面に並べる番** です。

レビューするときは `public/images/asset` もあわせて見てください。5W1H ごとのフォルダ構成が、これからの UI の骨格になります。

---

## 次に読む

- [使用する知識](./使用する知識.md)
- [Cloudflareについて](./Cloudflareについて.md)
- [cloudflareトンネルの作り方](./cloudflareトンネルの作り方.md)
- [ルールブック](./ルールブック.md)
- [第一回 — 趣旨](../第一回/README.md)
- [説明書一覧](../README.md)