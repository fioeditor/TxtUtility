import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  devIndicators: false,
  agentRules: false,
  turbopack: { root: process.cwd() },
};
export default config;
