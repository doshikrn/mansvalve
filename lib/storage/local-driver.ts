import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import type { StorageDriver, UploadInput, UploadResult } from "./types";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const PUBLIC_BASE = "/uploads";

/**
 * Filesystem-backed storage driver intended for local development. Files are
 * written under `public/uploads/**` so Next.js can serve them directly.
 *
 * Do NOT use this driver in production — it does not scale across instances
 * and uploaded files are lost on every deploy.
 */
export class LocalStorageDriver implements StorageDriver {
  readonly name = "local";

  async upload(input: UploadInput): Promise<UploadResult> {
    const safeKey = normalizeKey(input.key);
    const absolute = path.join(UPLOAD_ROOT, safeKey);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, input.body);

    return {
      key: safeKey,
      url: this.getPublicUrl(safeKey),
      size: input.body.byteLength,
      driver: this.name,
    };
  }

  async delete(key: string): Promise<void> {
    const safeKey = normalizeKey(key);
    const absolute = path.join(UPLOAD_ROOT, safeKey);
    try {
      await fs.rm(absolute, { force: true });
    } catch {
      /* noop */
    }
  }

  getPublicUrl(key: string): string {
    const base = process.env.MEDIA_PUBLIC_BASE_URL?.trim() || PUBLIC_BASE;
    const normalized = normalizeKey(key);
    return `${base.replace(/\/$/, "")}/${normalized}`;
  }
}

function normalizeKey(key: string): string {
  return key
    .replace(/^\/+/, "")
    .replace(/\.\.+/g, "")
    .replace(/\\/g, "/")
    .slice(0, 500);
}
