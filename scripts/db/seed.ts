import "./_env";

import { spawnSync } from "node:child_process";
import path from "node:path";

/**
 * One-shot bootstrap: applies migrations, creates the first admin (when
 * bootstrap credentials are present in env) and imports the current file
 * catalog. Useful for spinning up a fresh environment.
 */
function run(step: string, script: string) {
  console.log(`\n[seed] -> ${step}`);
  const result = spawnSync("npx", ["tsx", script], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`[seed] step "${step}" failed with code ${result.status}`);
  }
}

async function main() {
  const scripts = path.join(process.cwd(), "scripts", "db");
  run("migrate", path.join(scripts, "migrate.ts"));
  run("create-admin", path.join(scripts, "create-admin.ts"));
  run("import-catalog", path.join(scripts, "import-catalog.ts"));
  console.log("\n[seed] done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
