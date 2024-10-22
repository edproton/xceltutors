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
};

export default nextConfig;
