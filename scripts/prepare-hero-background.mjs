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

const resize = (pipeline) =>
  pipeline.resize({
    width: Math.max(TARGET_W, w),
    withoutEnlargement: w >= TARGET_W,
    kernel: sharp.kernel.lanczos3,
  });

const blurred = resize(sharp(input).blur(BLUR_SIGMA));
const sharpLayer = resize(sharp(input));

const blurredWebp = await blurred.clone().webp({ quality: 92, effort: 6, smartSubsample: true }).toBuffer();
const blurredJpg = await blurred.clone().jpeg({ quality: 94, mozjpeg: true }).toBuffer();
const sharpWebp = await sharpLayer.clone().webp({ quality: 94, effort: 6, smartSubsample: true }).toBuffer();

await writeFile(join(outDir, "hero-background.webp"), blurredWebp);
await writeFile(join(outDir, "hero-background.jpg"), blurredJpg);
await writeFile(join(outDir, "hero-background-sharp.webp"), sharpWebp);

const outMeta = await sharp(blurredWebp).metadata();
console.log(`source: ${w}x${h}`);
console.log(`output: ${outMeta.width}x${outMeta.height}`);
console.log(`blurred webp: ${(blurredWebp.length / 1024).toFixed(1)} KB`);
console.log(`sharp webp: ${(sharpWebp.length / 1024).toFixed(1)} KB`);
