import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // 解决 Turbopack 警告
  experimental: {
    turbo: {
      root: '/Users/bo/polyv/1024/object-recognition-story-machine'
    }
  }
};

export default nextConfig;
