import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { StorageDriver, UploadInput, UploadResult } from "./types";

/**
 * Supabase Storage driver. Requires a service-role key because the admin
 * panel writes to the bucket directly from the server.
 *
 * Setup:
 *   1. Create a public bucket in Supabase (Storage -> New bucket).
 *   2. Put its name in `SUPABASE_STORAGE_BUCKET` (default: mansvalve-media).
 *   3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
 *   4. Set `MEDIA_DRIVER=supabase` and optionally
 *      `MEDIA_PUBLIC_BASE_URL=https://<project>.supabase.co/storage/v1/object/public/<bucket>`.
 */
export class SupabaseStorageDriver implements StorageDriver {
  readonly name = "supabase";
  private client: SupabaseClient | null = null;

  private getClient(): SupabaseClient {
    if (this.client) return this.client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase storage driver requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }
    this.client = createClient(url, key, {
      auth: { persistSession: false },
    });
    return this.client;
  }

  private getBucket(): string {
    return process.env.SUPABASE_STORAGE_BUCKET || "mansvalve-media";
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const bucket = this.getBucket();
    const { error } = await this.getClient()
      .storage.from(bucket)
      .upload(input.key, input.body, {
        contentType: input.contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return {
      key: input.key,
      url: this.getPublicUrl(input.key),
      size: input.body.byteLength,
      driver: this.name,
    };
  }

  async delete(key: string): Promise<void> {
    const bucket = this.getBucket();
    const { error } = await this.getClient()
      .storage.from(bucket)
      .remove([key]);
    if (error) {
      console.error("[supabase-driver] delete failed", error.message);
    }
  }

  getPublicUrl(key: string): string {
    const configured = process.env.MEDIA_PUBLIC_BASE_URL?.trim();
    if (configured) {
      return `${configured.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
    }
    const { data } = this.getClient()
      .storage.from(this.getBucket())
      .getPublicUrl(key);
    return data.publicUrl;
  }
}
