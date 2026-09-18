import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The home directory above this repo holds a stray package-lock.json, which
  // Turbopack would otherwise infer as the workspace root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
