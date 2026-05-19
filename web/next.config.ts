import path from "path";

import dotenv from "dotenv";
import type { NextConfig } from "next";

/** Single monorepo `.env` at repo root (shared with `api/`). */
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

const apiUrl = process.env.API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/sign-in", destination: "/login", permanent: false },
      { source: "/signup", destination: "/register", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
