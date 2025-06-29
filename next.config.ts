import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/qrbrasil/:path*',
        destination: 'https://ev.playcom.net.br/wp-json/qrbrasil/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
