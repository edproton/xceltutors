import "./lib/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "epe.brightspotcdn.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
