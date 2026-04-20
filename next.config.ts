import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@carbon/react', '@carbon/icons-react', '@carbon/charts-react', 'reactflow'],

  sassOptions: {
    includePaths: [path.join(process.cwd(), 'node_modules')],
  },
};

export default nextConfig;
