import "./_env";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);

  console.log("[db:migrate] applying migrations…");
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  console.log("[db:migrate] done.");

  await sql.end({ timeout: 5 });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
