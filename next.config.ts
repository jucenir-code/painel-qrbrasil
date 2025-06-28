import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
};

export default nextConfig;
