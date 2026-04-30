import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'weeth-s3-dev.s3.ap-northeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'weeth-s3-prod.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
