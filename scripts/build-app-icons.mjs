/**
 * Совместимость: раньше писал в app/icon.png.
 * Иконки для вкладки и SEO теперь в `public/` — см. `generate-brand-icons.mjs`.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gen = join(root, "scripts/generate-brand-icons.mjs");

const r = spawnSync(process.execPath, [gen], { cwd: root, stdio: "inherit" });
process.exit(r.status === null ? 1 : r.status);
