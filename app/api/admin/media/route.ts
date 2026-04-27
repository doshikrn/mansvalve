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
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
const MAX_ALT_LENGTH = 300;
const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/tiff",
]);
const ALLOWED_DOCUMENT_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

  const isImage = file.type.startsWith("image/");
  const sizeLimit = isImage ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
  if (file.size > sizeLimit) {
    const maxMb = isImage ? 10 : 20;
    return NextResponse.json(
      { ok: false, error: `File is too large. Max ${maxMb} MB.` },
      { status: 413 },
    );
  }

  const allowedImage = ALLOWED_IMAGE_MIME.has(file.type);
  const allowedDocument = ALLOWED_DOCUMENT_MIME.has(file.type);
  if (!allowedImage && !allowedDocument) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unsupported media type. Allowed: JPG, PNG, WEBP, AVIF, GIF, TIFF, PDF, DOC, DOCX, XLS, XLSX.",
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
    const originalName = stripExtension(file.name || "upload");
    const namePrefix = slugify(originalName) || "file";
    const stamp = new Date().toISOString().slice(0, 10);
    let key = "";
    let contentType = file.type;
    let outputBody: Buffer = source;
    let width: number | null = null;
    let height: number | null = null;

    if (allowedImage) {
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
      outputBody = output.data;
      width = output.info.width ?? null;
      height = output.info.height ?? null;
      contentType = "image/webp";
      key = `${folder}/${stamp}/${namePrefix}-${randomUUID()}.webp`;
    } else {
      const safeExt = resolveDocumentExtension(file.type, file.name);
      key = `${folder}/${stamp}/${namePrefix}-${randomUUID()}${safeExt}`;
    }

    const driver = getStorageDriver();
    const uploaded = await driver.upload({
      key,
      contentType,
      body: outputBody,
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
        error: "Failed to process or upload media.",
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

function resolveDocumentExtension(mime: string, filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const byMime: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  };
  const safeByMime = byMime[mime];
  if (safeByMime) return safeByMime;
  if ([".pdf", ".doc", ".docx", ".xls", ".xlsx"].includes(ext)) return ext;
  return ".bin";
}
