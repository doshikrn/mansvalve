import "./_env";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";

import { adminUsers } from "../../lib/db/schema";

async function readCredentials(): Promise<{ email: string; password: string; name?: string }> {
  const envEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const envPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (envEmail && envPassword) {
    return { email: envEmail, password: envPassword };
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = (await rl.question("Password (min 8 chars): ")).trim();
  const name = (await rl.question("Display name (optional): ")).trim() || undefined;
  rl.close();
  return { email, password, name };
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required.");

  const { email, password, name } = await readCredentials();
  if (!email || !email.includes("@")) throw new Error("Invalid email.");
  if (!password || password.length < 8)
    throw new Error("Password must be at least 8 characters long.");

  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema: { adminUsers } });

  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  const hash = await bcrypt.hash(password, 12);

  if (existing.length) {
    await db
      .update(adminUsers)
      .set({ passwordHash: hash, name: name ?? null, isActive: true, updatedAt: new Date() })
      .where(eq(adminUsers.id, existing[0].id));
    console.log(`[admin:create] updated existing admin ${email}`);
  } else {
    await db.insert(adminUsers).values({
      email,
      passwordHash: hash,
      name: name ?? null,
      role: "admin",
      isActive: true,
    });
    console.log(`[admin:create] created admin ${email}`);
  }

  await sql.end({ timeout: 5 });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
