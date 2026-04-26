import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minor security / response hygiene; does not change UI.
  poweredByHeader: false,
};

export default nextConfig;
