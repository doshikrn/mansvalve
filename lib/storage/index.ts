import "server-only";

import { LocalStorageDriver } from "./local-driver";
import { SupabaseStorageDriver } from "./supabase-driver";
import type { StorageDriver } from "./types";

/**
 * Returns the configured media storage driver.
 *
 * Drivers implement the same interface so the rest of the admin only deals
 * with `StorageDriver` and never knows about Supabase / local disk.
 */
let cachedDriver: StorageDriver | null = null;

export function getStorageDriver(): StorageDriver {
  if (cachedDriver) return cachedDriver;

  const selected = (process.env.MEDIA_DRIVER || "local").toLowerCase();
  switch (selected) {
    case "supabase":
      cachedDriver = new SupabaseStorageDriver();
      break;
    case "local":
    default:
      cachedDriver = new LocalStorageDriver();
      break;
  }
  return cachedDriver;
}

export type { StorageDriver, UploadInput, UploadResult } from "./types";
