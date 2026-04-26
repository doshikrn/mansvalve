import path from "node:path";
import { randomUUID } from "node:crypto";

import sharp from "sharp";
import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/current-user";
import { isDatabaseConfigured } from "@/lib/db/client";
import { createMediaAsset } from "@/lib/services/media";
import { slugify } from "@/lib/services/slug";
import { getStorageDriver } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_ALT_LENGTH = 300;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/tiff",
]);

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Database is not configured." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid multipart request." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Field `file` is required." },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json(
      { ok: false, error: "Uploaded file is empty." },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File is too large. Max 10 MB." },
      { status: 413 },
    );
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unsupported media type. Please upload JPEG, PNG, WEBP or AVIF.",
      },
      { status: 415 },
    );
  }

  const altRaw = formData.get("alt");
  const folderRaw = formData.get("folder");

  const alt =
    typeof altRaw === "string"
      ? altRaw.trim().slice(0, MAX_ALT_LENGTH)
      : "";
  const folder =
    typeof folderRaw === "string"
      ? sanitizeFolder(folderRaw)
      : "general";

  try {
    const source = Buffer.from(await file.arrayBuffer());

    const output = await sharp(source, { failOn: "none" })
      .rotate()
      .resize({
        width: 2200,
        height: 2200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    const width = output.info.width ?? null;
    const height = output.info.height ?? null;
    const contentType = "image/webp";

    const originalName = stripExtension(file.name || "upload");
    const namePrefix = slugify(originalName) || "image";
    const stamp = new Date().toISOString().slice(0, 10);
    const key = `${folder}/${stamp}/${namePrefix}-${randomUUID()}.webp`;

    const driver = getStorageDriver();
    const uploaded = await driver.upload({
      key,
      contentType,
      body: output.data,
    });

    const createdBy = Number.parseInt(session.sub, 10);
    const asset = await createMediaAsset({
      storageKey: uploaded.key,
      url: uploaded.url,
      mimeType: contentType,
      sizeBytes: uploaded.size,
      width,
      height,
      alt: alt || null,
      driver: uploaded.driver,
      createdBy: Number.isFinite(createdBy) ? createdBy : null,
    });

    return NextResponse.json({
      ok: true,
      asset: {
        id: asset.id,
        storageKey: asset.storageKey,
        url: asset.url,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        width: asset.width,
        height: asset.height,
        alt: asset.alt,
        driver: asset.driver,
        createdAt: asset.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[media-upload] failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to process or upload image.",
      },
      { status: 500 },
    );
  }
}

function sanitizeFolder(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/")
    .replace(/\.\./g, "");

  return normalized || "general";
}

function stripExtension(filename: string): string {
  const ext = path.extname(filename);
  if (!ext) return filename;
  return filename.slice(0, -ext.length);
}
