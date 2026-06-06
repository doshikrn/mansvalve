import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const src = process.env.HERO_BG_SOURCE ?? join(process.cwd(), "scripts", "sources", "hero-background-source.png");
const outDir = join(process.cwd(), "public", "images");
const TARGET_W = 1920;
const BLUR_SIGMA = 5;

const input = await readFile(src);
const meta = await sharp(input).metadata();
const w = meta.width ?? 1024;
const h = meta.height ?? 560;

const pipeline = sharp(input)
  .blur(BLUR_SIGMA)
  .resize({
    width: Math.max(TARGET_W, w),
    withoutEnlargement: w >= TARGET_W,
    kernel: sharp.kernel.lanczos3,
  });

const webp = await pipeline.clone().webp({ quality: 92, effort: 6, smartSubsample: true }).toBuffer();
const jpg = await pipeline.clone().jpeg({ quality: 94, mozjpeg: true }).toBuffer();

await writeFile(join(outDir, "hero-background.webp"), webp);
await writeFile(join(outDir, "hero-background.jpg"), jpg);

const outMeta = await sharp(webp).metadata();
console.log(`source: ${w}x${h}`);
console.log(`output: ${outMeta.width}x${outMeta.height} (blur sigma ${BLUR_SIGMA})`);
console.log(`webp: ${(webp.length / 1024).toFixed(1)} KB, jpg: ${(jpg.length / 1024).toFixed(1)} KB`);
