import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_API_BASE_URL: process.env.DEEPSEEK_API_BASE_URL,
  },
};

export default nextConfig;
