/**
 * タイトル PNG を表示サイズ向けに縮小＋ PNG 圧縮（sharp は npx -p sharp で渡す）
 * node scripts/compress-title-png.mjs public/images/title_ja.png ...
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MAX_WIDTH = 1536;
/** title_ja.png 圧縮後と揃える */
const TITLE_BANNER_WIDTH = 1536;
const TITLE_BANNER_HEIGHT = 360;

async function upscaleTitleKo({ source, dest }) {
  if (!fs.existsSync(source)) {
    console.error("missing source", source);
    process.exitCode = 1;
    return;
  }
  const before = fs.statSync(source).size;
  const meta = await sharp(source).metadata();
  const buf = await sharp(source)
    .resize(TITLE_BANNER_WIDTH, TITLE_BANNER_HEIGHT, {
      fit: "contain",
      position: "center",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
    .toBuffer();
  fs.writeFileSync(dest, buf);
  const after = buf.length;
  const outMeta = await sharp(buf).metadata();
  console.log(
    "upscale",
    path.basename(source),
    "→",
    path.basename(dest),
    `${meta.width}x${meta.height}`,
    "→",
    `${outMeta.width}x${outMeta.height}`,
    `${before} → ${after} bytes`,
  );
}

async function compressOne(fileArg) {
  const file = path.resolve(fileArg);
  if (!fs.existsSync(file)) {
    console.error("missing", file);
    process.exitCode = 1;
    return;
  }
  const before = fs.statSync(file).size;
  const meta = await sharp(file).metadata();
  let pipeline = sharp(file);
  if ((meta.width ?? 0) > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }
  const buf = await pipeline
    .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
    .toBuffer();
  fs.writeFileSync(file, buf);
  const after = buf.length;
  console.log(
    path.basename(file),
    `${meta.width}x${meta.height}`,
    "→",
    `${(await sharp(buf).metadata()).width}x${(await sharp(buf).metadata()).height}`,
    `${before} → ${after} bytes (${((after / before) * 100).toFixed(1)}%)`,
  );
}

const args = process.argv.slice(2);
if (args[0] === "--upscale-ko") {
  const source =
    args[1] ?? path.join("..", "godabo-1", "public", "images", "title_ko.png");
  const dest = args[2] ?? path.join("public", "images", "title_ko.png");
  await upscaleTitleKo({ source: path.resolve(source), dest: path.resolve(dest) });
} else if (args.length === 0) {
  console.error(
    "usage: node scripts/compress-title-png.mjs <png>... | --upscale-ko [source] [dest]",
  );
  process.exit(1);
} else {
  for (const f of args) {
    await compressOne(f);
  }
}