import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@carbon/react', '@carbon/icons-react', '@carbon/charts-react', 'reactflow'],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'node_modules')],
  },
};

export default nextConfig;
