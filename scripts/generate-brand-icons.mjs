/**
 * Генерирует public/favicon.ico, favicon PNG, icon.png и apple-icon.png.
 * Favicon делается из упрощённого знака без текста: он читается на 16px и
 * не превращается в чёрный фрагмент в Google.
 * Большие app icons остаются из полного фирменного знака как в Header.
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

async function resizePng(
  buf,
  sizePx,
  background = { r: 255, g: 255, b: 255, alpha: 1 },
) {
  return sharp(buf)
    .resize(sizePx, sizePx, {
      fit: "contain",
      background,
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

  const { buf: brandRaster, label } = await loadRasterSource();
  const faviconSvg = await readFile(fallbackSvg);
  const faviconRaster = await sharp(faviconSvg, { density: 384 }).png().toBuffer();
  const transparent = { r: 255, g: 255, b: 255, alpha: 0 };

  const icon512 = await resizePng(brandRaster, 512);
  const apple180 = await resizePng(brandRaster, 180);
  const fav48 = await resizePng(faviconRaster, 48, transparent);
  const fav32 = await resizePng(faviconRaster, 32, transparent);
  const fav16 = await resizePng(faviconRaster, 16, transparent);

  await writeFile(join(publicDir, "icon.png"), icon512);
  await writeFile(join(publicDir, "apple-icon.png"), apple180);
  await writeFile(join(publicDir, "favicon.svg"), faviconSvg);
  await writeFile(join(publicDir, "favicon-32.png"), fav32);
  await writeFile(join(publicDir, "favicon-16.png"), fav16);
  /** Один кадр 48×48 в ICO + отдельные слои 16/32 — стабильнее парсинга во вкладке */
  await writeFile(join(publicDir, "favicon.ico"), await toIco([fav16, fav32, fav48]));

  console.log(
    `Wrote public/favicon.ico, favicon.svg, favicon-16.png, favicon-32.png, icon.png, apple-icon.png (app icon source: ${label})`,
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
