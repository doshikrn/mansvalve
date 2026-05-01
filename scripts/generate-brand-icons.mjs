/**
 * Генерирует public/favicon.ico, public/icon.png, public/apple-icon.png
 * из фирменного знака `public/images/mansvalve-brand-mark.png` (как в Header).
 * Если PNG ещё нет в репозитории — используется `scripts/brand/mansvalve-favicon.svg`.
 *
 * Запуск: npm run generate:icons
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const publicDir = join(root, "public");
const brandMarkPng = join(root, "public/images/mansvalve-brand-mark.png");
const fallbackSvg = join(root, "scripts/brand/mansvalve-favicon.svg");

async function resizePng(buf, sizePx) {
  return sharp(buf)
    .resize(sizePx, sizePx, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      position: "center",
    })
    .png()
    .toBuffer();
}

async function loadRasterSource() {
  try {
    await access(brandMarkPng, constants.R_OK);
    const buf = await readFile(brandMarkPng);
    return { buf, label: "public/images/mansvalve-brand-mark.png" };
  } catch {
    const svg = await readFile(fallbackSvg);
    const buf = await sharp(svg, { density: 384 }).png().toBuffer();
    return { buf, label: "scripts/brand/mansvalve-favicon.svg (fallback)" };
  }
}

async function main() {
  await mkdir(join(publicDir, "images"), { recursive: true });

  const { buf: raster, label } = await loadRasterSource();

  const icon512 = await resizePng(raster, 512);
  const apple180 = await resizePng(raster, 180);
  const fav48 = await resizePng(raster, 48);
  const fav32 = await resizePng(raster, 32);
  const fav16 = await resizePng(raster, 16);

  await writeFile(join(publicDir, "icon.png"), icon512);
  await writeFile(join(publicDir, "apple-icon.png"), apple180);
  await writeFile(join(publicDir, "favicon-32.png"), fav32);
  await writeFile(join(publicDir, "favicon-16.png"), fav16);
  /** Один кадр 48×48 в ICO + отдельные слои 16/32 — стабильнее парсинга во вкладке */
  await writeFile(join(publicDir, "favicon.ico"), await toIco([fav16, fav32, fav48]));

  console.log(
    `Wrote public/favicon.ico, favicon-16.png, favicon-32.png, icon.png, apple-icon.png (source: ${label})`,
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
