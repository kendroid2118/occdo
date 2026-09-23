import type { NextConfig } from "next";

import { securityHeaderEntries } from "./lib/security/headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  headers: async () => securityHeaderEntries(process.env.NODE_ENV === "production"),
};

export default nextConfig;
