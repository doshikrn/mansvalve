import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const src = process.env.HERO_VALVE_SOURCE ?? join(process.cwd(), "scripts", "sources", "hero-valve-source.png");
const outDir = join(process.cwd(), "public", "images");
const TARGET_H = 1400;

const input = await readFile(src);
const meta = await sharp(input).metadata();
const h = meta.height ?? 1024;

const pipeline = sharp(input).resize({
  height: Math.max(TARGET_H, h),
  withoutEnlargement: h >= TARGET_H,
  kernel: sharp.kernel.lanczos3,
});

const png = await pipeline.clone().png({ compressionLevel: 6, adaptiveFiltering: true }).toBuffer();
const webp = await pipeline
  .clone()
  .webp({ quality: 96, alphaQuality: 100, effort: 6, lossless: false })
  .toBuffer();

await writeFile(join(outDir, "hero-valve.png"), png);
await writeFile(join(outDir, "hero-valve.webp"), webp);

const outMeta = await sharp(png).metadata();
console.log(`source: ${meta.width}x${meta.height}`);
console.log(`output: ${outMeta.width}x${outMeta.height}`);
console.log(`png: ${(png.length / 1024).toFixed(1)} KB, webp: ${(webp.length / 1024).toFixed(1)} KB`);
