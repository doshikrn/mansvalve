import { isDatabaseConfigured } from "@/lib/db/drizzle-core";

import type { PublicCatalogRuntimeInfo, PublicCatalogSource } from "./types";

/** Script-safe catalog source selection (no `server-only` import). */
export function getPublicCatalogSource(): PublicCatalogSource {
  const explicit = process.env.PUBLIC_CATALOG_SOURCE?.trim().toLowerCase();
  if (explicit === "json") {
    const jsonRecoveryAllowed =
      process.env.NODE_ENV !== "production" ||
      process.env.PUBLIC_CATALOG_ALLOW_JSON_FALLBACK === "true" ||
      process.env.PUBLIC_CATALOG_RECOVERY_MODE === "json";

    if (!jsonRecoveryAllowed && isDatabaseConfigured()) {
      console.error(
        "[public-catalog] PUBLIC_CATALOG_SOURCE=json is ignored in production because DATABASE_URL is configured. Use PUBLIC_CATALOG_RECOVERY_MODE=json for an explicit JSON recovery snapshot.",
      );
      return "db";
    }

    return "json";
  }

  if (explicit === "db") {
    return explicit;
  }

  if (process.env.PUBLIC_CATALOG_FROM_DB === "true") {
    return "db";
  }

  return isDatabaseConfigured() ? "db" : "json";
}

export function getPublicCatalogRuntimeInfo(): PublicCatalogRuntimeInfo {
  const configuredSource = getPublicCatalogSource();
  const databaseConfigured = isDatabaseConfigured();
  const effectiveSource =
    configuredSource === "db" && databaseConfigured ? "db" : "json";

  return {
    configuredSource,
    effectiveSource,
    databaseConfigured,
    adminChangesVisibleOnPublicSite: effectiveSource === "db",
  };
}
