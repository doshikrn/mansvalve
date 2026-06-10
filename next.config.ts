import path from "node:path";

import type { NextConfig } from "next";

import { ALL_CATALOG_PATH_REDIRECTS } from "./lib/catalog-path-redirects";
import { buildNextImageRemotePatterns } from "./lib/media-image-trusted-hosts";

/** Lockfiles higher up the filesystem (e.g. user home) must not become the workspace root. */
const projectRoot = path.resolve(process.cwd());

const remotePatterns = buildNextImageRemotePatterns();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.mansvalve-group.kz" }],
        destination: "https://mansvalve-group.kz/:path*",
        permanent: true,
      },
      ...ALL_CATALOG_PATH_REDIRECTS.map(({ source, destination }) => ({
        source,
        destination,
        permanent: true,
      })),
    ];
  },
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  ...(remotePatterns.length > 0
    ? {
        images: {
          remotePatterns,
        },
      }
    : {}),
};

export default nextConfig;
