/**
 * Генерирует `app/icon.png`, `app/apple-icon.png` из фирменного знака
 * `public/images/mansvalve-brand-mark.png`.
 *
 * Браузерная вкладка использует PNG по конвенции Next (`app/icon.png`).
 * Отдельный `favicon.ico` не создаём: генерация через `to-ico` давала на
 * части окружений «битое» отображение иконки во вкладке.
 *
 * После замены PNG: `node scripts/build-app-icons.mjs`
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

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

  const icon512 = await resizePng(src, 512);
  const apple180 = await resizePng(src, 180);

  await writeFile(join(appDir, "icon.png"), icon512);
  await writeFile(join(appDir, "apple-icon.png"), apple180);

  console.log(
    "Wrote app/icon.png, app/apple-icon.png from public/images/mansvalve-brand-mark.png",
  );
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
