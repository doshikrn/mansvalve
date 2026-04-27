/**
 * Генерирует `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`
 * из фирменного знака `public/images/mansvalve-brand-mark.png`.
 *
 * После замены PNG: `node scripts/build-app-icons.mjs`
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, "..");
const srcPath = join(root, "public/images/mansvalve-brand-mark.png");
const appDir = join(root, "app");

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

async function main() {
  const src = await readFile(srcPath);

  const png16 = await resizePng(src, 16);
  const png32 = await resizePng(src, 32);
  const png48 = await resizePng(src, 48);
  const icon512 = await resizePng(src, 512);
  const apple180 = await resizePng(src, 180);

  const ico = await toIco([png16, png32, png48]);

  await writeFile(join(appDir, "favicon.ico"), ico);
  await writeFile(join(appDir, "icon.png"), icon512);
  await writeFile(join(appDir, "apple-icon.png"), apple180);

  console.log(
    "Wrote app/favicon.ico, app/icon.png, app/apple-icon.png from public/images/mansvalve-brand-mark.png",
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
