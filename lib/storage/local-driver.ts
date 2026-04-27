import "server-only";

import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";

import type { StorageDriver, UploadInput, UploadResult } from "./types";

const PUBLIC_BASE = "/uploads";

const UPLOAD_ROOT = resolveUploadRoot();

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
    const normalized = normalizeKey(key);
    const relativePath = `${PUBLIC_BASE}/${normalized}`;
    const base = process.env.MEDIA_PUBLIC_BASE_URL?.trim();
    if (!base) return relativePath;
    return buildPublicUrlFromBase(base, normalized, relativePath);
  }
}

function resolveUploadRoot(): string {
  const explicit = process.env.MEDIA_LOCAL_UPLOAD_ROOT?.trim();
  if (explicit) {
    return path.resolve(explicit);
  }

  const cwd = process.cwd();
  const cwdPublicDir = path.join(cwd, "public");
  if (existsSync(cwdPublicDir)) {
    return path.join(cwd, "public", "uploads");
  }

  // Compatibility for deployments started from the workspace parent
  // where the Next app itself lives in ./mansvalve.
  const nestedAppRoot = path.join(cwd, "mansvalve");
  if (existsSync(path.join(nestedAppRoot, "public"))) {
    return path.join(nestedAppRoot, "public", "uploads");
  }

  return path.join(cwd, "public", "uploads");
}

function normalizeKey(key: string): string {
  return key
    .replace(/^\/+/, "")
    .replace(/\.\.+/g, "")
    .replace(/\\/g, "/")
    .slice(0, 500);
}

function buildPublicUrlFromBase(
  base: string,
  normalizedKey: string,
  fallbackRelative: string,
): string {
  const cleanBase = base.replace(/\/+$/, "");

  // Relative base configured explicitly.
  if (cleanBase.startsWith("/")) {
    if (cleanBase.endsWith("/uploads")) {
      return `${cleanBase}/${normalizedKey}`;
    }
    return `${cleanBase}/uploads/${normalizedKey}`;
  }

  // Absolute origin/path.
  if (/^https?:\/\//i.test(cleanBase)) {
    try {
      const parsed = new URL(cleanBase);
      const pathPrefix = parsed.pathname.replace(/\/+$/, "");
      const joinedPath = pathPrefix.endsWith("/uploads")
        ? `${pathPrefix}/${normalizedKey}`
        : `${pathPrefix}/uploads/${normalizedKey}`;
      return `${parsed.origin}${joinedPath}`;
    } catch {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[media:local] invalid MEDIA_PUBLIC_BASE_URL, fallback to relative", {
          value: base,
        });
      }
      return fallbackRelative;
    }
  }

  const trimmed = cleanBase.replace(/^\/+/, "");
  const hostToken = trimmed.split("/")[0] ?? "";
  const hostLike =
    hostToken.includes(".") ||
    /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(hostToken);
  const looksLikeHostWithPath = hostLike && /^[a-z0-9.-]+(?::\d+)?\/.+/i.test(trimmed);
  if (looksLikeHostWithPath) {
    const [host, ...pathParts] = trimmed.split("/");
    const pathPrefix = `/${pathParts.join("/")}`.replace(/\/+$/, "");
    const joinedPath = pathPrefix.endsWith("/uploads")
      ? `${pathPrefix}/${normalizedKey}`
      : `${pathPrefix}/uploads/${normalizedKey}`;
    const scheme = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)
      ? "http://"
      : "https://";
    return `${scheme}${host}${joinedPath}`;
  }

  const looksLikeBareHost = hostLike && /^[a-z0-9.-]+(?::\d+)?$/i.test(trimmed);
  if (looksLikeBareHost) {
    const scheme = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmed)
      ? "http://"
      : "https://";
    return `${scheme}${trimmed}${fallbackRelative}`;
  }

  // Treat unknown values (e.g. "uploads", "cdn", "static") as relative path prefixes.
  const relPrefix = `/${trimmed}`.replace(/\/+/g, "/").replace(/\/$/, "");
  if (relPrefix.endsWith("/uploads")) {
    return `${relPrefix}/${normalizedKey}`;
  }
  return `${relPrefix}/uploads/${normalizedKey}`;
}
