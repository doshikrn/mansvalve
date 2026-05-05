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

async function pngToIcoBitmap(pngBuffer, sizePx) {
  const rgba = await sharp(pngBuffer)
    .resize(sizePx, sizePx, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      position: "center",
    })
    .ensureAlpha()
    .raw()
    .toBuffer();

  const pixelBytes = Buffer.alloc(sizePx * sizePx * 4);
  let out = 0;

  for (let y = sizePx - 1; y >= 0; y -= 1) {
    for (let x = 0; x < sizePx; x += 1) {
      const input = (y * sizePx + x) * 4;
      pixelBytes[out] = rgba[input + 2];
      pixelBytes[out + 1] = rgba[input + 1];
      pixelBytes[out + 2] = rgba[input];
      pixelBytes[out + 3] = rgba[input + 3];
      out += 4;
    }
  }

  const maskStride = Math.ceil(sizePx / 32) * 4;
  const andMask = Buffer.alloc(maskStride * sizePx, 0);
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(sizePx, 4);
  header.writeInt32LE(sizePx * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16);
  header.writeUInt32LE(pixelBytes.length, 20);

  return Buffer.concat([header, pixelBytes, andMask]);
}

async function buildIco(faviconRaster, sizes) {
  const images = await Promise.all(
    sizes.map(async (sizePx) => ({
      sizePx,
      bitmap: await pngToIcoBitmap(faviconRaster, sizePx),
    })),
  );
  const headerSize = 6 + images.length * 16;
  const header = Buffer.alloc(headerSize);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = headerSize;
  images.forEach((image, index) => {
    const dirOffset = 6 + index * 16;
    header.writeUInt8(image.sizePx === 256 ? 0 : image.sizePx, dirOffset);
    header.writeUInt8(image.sizePx === 256 ? 0 : image.sizePx, dirOffset + 1);
    header.writeUInt8(0, dirOffset + 2);
    header.writeUInt8(0, dirOffset + 3);
    header.writeUInt16LE(1, dirOffset + 4);
    header.writeUInt16LE(32, dirOffset + 6);
    header.writeUInt32LE(image.bitmap.length, dirOffset + 8);
    header.writeUInt32LE(offset, dirOffset + 12);
    offset += image.bitmap.length;
  });

  return Buffer.concat([header, ...images.map((image) => image.bitmap)]);
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
  await writeFile(join(publicDir, "favicon-48.png"), fav48);
  await writeFile(join(publicDir, "favicon-32.png"), fav32);
  await writeFile(join(publicDir, "favicon-16.png"), fav16);
  await writeFile(join(publicDir, "favicon.ico"), await buildIco(faviconRaster, [16, 32, 48]));

  console.log(
    `Wrote public/favicon.ico, favicon.svg, favicon-16.png, favicon-32.png, favicon-48.png, icon.png, apple-icon.png (app icon source: ${label})`,
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
