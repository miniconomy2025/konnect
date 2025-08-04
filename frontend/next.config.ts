import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'konnectbuckettest.s3.af-south-1.amazonaws.com',
        pathname: '**', // Allow any path
      },
      {
        protocol: 'https',
        hostname: 'konnectbuckettest.s3.amazonaws.com',
        pathname: '**', // Allow any path
      },
    ],
  }
};

export default nextConfig;
