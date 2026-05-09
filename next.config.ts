import path from "node:path";

import type { NextConfig } from "next";

/** Lockfiles higher up the filesystem (e.g. user home) must not become the workspace root. */
const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
