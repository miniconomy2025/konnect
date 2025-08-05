import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'konnectbuckettest.s3.af-south-1.amazonaws.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'konnectbuckettest.s3.amazonaws.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
