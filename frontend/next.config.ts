import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve avatars from parent directory
  async rewrites() {
    return [
      {
        source: '/avatars/:path*',
        destination: '/../avatars/:path*',
      },
    ];
  },
};

export default nextConfig;
