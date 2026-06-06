import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const src =
  process.env.HERO_BG_SOURCE ??
  String.raw`C:\Users\user\AppData\Roaming\Cursor\User\workspaceStorage\473bc95f4f3be156d2ebe00ede362b4a\images\ChatGPT Image 6 июн. 2026 г., 12_57_20-e52a11a5-efea-40f9-bc58-c61b269eeb49.png`;
const outDir = join(process.cwd(), "public", "images");
const TARGET_W = 2560;

const input = await readFile(src);
const meta = await sharp(input).metadata();
const w = meta.width ?? 1024;
const h = meta.height ?? 341;
const cropW = Math.round(w * 0.64);

const pipeline = sharp(input)
  .extract({ left: 0, top: 0, width: cropW, height: h })
  .resize({ width: TARGET_W, withoutEnlargement: false, kernel: sharp.kernel.lanczos3 });

const webp = await pipeline.clone().webp({ quality: 90, effort: 6, smartSubsample: true }).toBuffer();
const jpg = await pipeline.clone().jpeg({ quality: 92, mozjpeg: true }).toBuffer();

await writeFile(join(outDir, "hero-background.webp"), webp);
await writeFile(join(outDir, "hero-background.jpg"), jpg);

const outMeta = await sharp(webp).metadata();
console.log(`source: ${w}x${h}`);
console.log(`crop: ${cropW}x${h}`);
console.log(`output: ${outMeta.width}x${outMeta.height}`);
console.log(`webp: ${(webp.length / 1024).toFixed(1)} KB, jpg: ${(jpg.length / 1024).toFixed(1)} KB`);
