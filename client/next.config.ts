import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN ?? (process.env.NODE_ENV === "development" ? "http://localhost:3001" : undefined);
    if (!apiOrigin) return [];

    return [{
      source: "/api/:path*",
      destination: `${apiOrigin}/:path*`,
    }];
  },
};

export default nextConfig;
