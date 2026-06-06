import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const src = process.env.HERO_BG_SOURCE ?? join(process.cwd(), "scripts", "sources", "hero-background-source.png");
const outDir = join(process.cwd(), "public", "images");
const TARGET_W = 2560;
const VALVE_CROP_RATIO = 0.64;

const input = await readFile(src);
const meta = await sharp(input).metadata();
const w = meta.width ?? 1024;
const h = meta.height ?? 560;
const cropW = Math.round(w * VALVE_CROP_RATIO);

const resizeWidth = Math.max(TARGET_W, cropW);
const pipeline = sharp(input)
  .extract({ left: 0, top: 0, width: cropW, height: h })
  .resize({
    width: resizeWidth,
    withoutEnlargement: cropW >= TARGET_W,
    kernel: sharp.kernel.lanczos3,
  });

const webp = await pipeline.clone().webp({ quality: 90, effort: 6, smartSubsample: true }).toBuffer();
const jpg = await pipeline.clone().jpeg({ quality: 92, mozjpeg: true }).toBuffer();

await writeFile(join(outDir, "hero-background.webp"), webp);
await writeFile(join(outDir, "hero-background.jpg"), jpg);

const outMeta = await sharp(webp).metadata();
console.log(`source: ${w}x${h}`);
console.log(`crop: ${cropW}x${h}`);
console.log(`output: ${outMeta.width}x${outMeta.height}`);
console.log(`webp: ${(webp.length / 1024).toFixed(1)} KB, jpg: ${(jpg.length / 1024).toFixed(1)} KB`);
