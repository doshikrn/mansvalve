/**
 * Генерирует public/favicon.ico, favicon PNG, icon.png и apple-icon.png.
 * Все favicon/app icons генерируются из одного фирменного знака, чтобы
 * Google Search Console, вкладка браузера и выдача не показывали разные
 * маленькие значки после кэширования.
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
const faviconSvg = join(root, "scripts/brand/mansvalve-favicon-simple.svg");

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
    .flatten({ background })
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
  const faviconRaster = await sharp(await readFile(faviconSvg), { density: 384 })
    .png()
    .toBuffer();
  const white = { r: 255, g: 255, b: 255, alpha: 1 };

  const icon512 = await resizePng(brandRaster, 512);
  const apple180 = await resizePng(brandRaster, 180);
  const faviconGoogle = await resizePng(faviconRaster, 48, white);
  const fav96 = await resizePng(faviconRaster, 96, white);
  const fav48 = await resizePng(faviconRaster, 48, white);
  const fav32 = await resizePng(faviconRaster, 32, white);
  const fav16 = await resizePng(faviconRaster, 16, white);

  await writeFile(join(publicDir, "icon.png"), icon512);
  await writeFile(join(publicDir, "apple-icon.png"), apple180);
  await mkdir(join(root, "app"), { recursive: true });
  await writeFile(join(root, "app", "favicon.ico"), await toIco([fav16, fav32, fav48]));
  await writeFile(join(root, "app", "apple-icon.png"), apple180);
  await writeFile(join(publicDir, "favicon-google.png"), faviconGoogle);
  await writeFile(join(publicDir, "favicon-96.png"), fav96);
  await writeFile(join(publicDir, "favicon-48.png"), fav48);
  await writeFile(join(publicDir, "favicon-32.png"), fav32);
  await writeFile(join(publicDir, "favicon-16.png"), fav16);
  await writeFile(join(publicDir, "favicon.ico"), await toIco([fav16, fav32, fav48]));
  await writeFile(join(publicDir, "favicon-v2.ico"), await toIco([fav16, fav32, fav48]));
  await writeFile(join(publicDir, "favicon-v2-48.png"), fav48);
  await writeFile(join(publicDir, "favicon-v2-96.png"), fav96);
  await writeFile(join(publicDir, "favicon-mansvalve.ico"), await toIco([fav16, fav32, fav48]));
  await writeFile(join(publicDir, "favicon-mansvalve-16.png"), fav16);
  await writeFile(join(publicDir, "favicon-mansvalve-32.png"), fav32);
  await writeFile(join(publicDir, "favicon-mansvalve-48.png"), fav48);
  await writeFile(join(publicDir, "favicon-mansvalve-96.png"), fav96);

  console.log(
    `Wrote app/favicon.ico, app/apple-icon.png, public/favicon.ico, favicon-v2.ico, favicon-mansvalve.ico, favicon PNG variants, icon.png, apple-icon.png (app icon source: ${label}, favicon source: scripts/brand/mansvalve-favicon-simple.svg)`,
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
