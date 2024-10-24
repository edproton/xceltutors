/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "epe.brightspotcdn.com",
        port: "",
      },
    ],
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined, 
  },
};

export default nextConfig;
