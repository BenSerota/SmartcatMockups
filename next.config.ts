import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Prevent workspace root confusion
  experimental: {
    turbopack: {
      root: "/Users/benserota/Documents/Code Projects/iterative_translator"
    }
  }
};

export default nextConfig;
