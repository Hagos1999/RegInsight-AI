import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Required for ReactFlow to work without SSR issues
  transpilePackages: ['reactflow'],
};

export default nextConfig;
