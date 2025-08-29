import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DOUBAO_API_KEY: process.env.DOUBAO_API_KEY,
    DOUBAO_API_BASE_URL: process.env.DOUBAO_API_BASE_URL,
  },
  devIndicators: false
};

export default nextConfig;
