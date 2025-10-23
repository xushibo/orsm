import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // 解决 Turbopack 警告
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
