import { config } from "dotenv";
import path from "node:path";

/**
 * Loads environment variables from `.env.local` first, then `.env`, so tsx
 * scripts behave the same way Next.js does during `next dev`.
 */
const root = path.resolve(process.cwd());
config({ path: path.join(root, ".env.local") });
config({ path: path.join(root, ".env") });
