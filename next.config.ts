import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent workspace root confusion
  experimental: {
    turbopack: {
      root: "/Users/benserota/Documents/Code Projects/iterative_translator"
    }
  }
};

export default nextConfig;
