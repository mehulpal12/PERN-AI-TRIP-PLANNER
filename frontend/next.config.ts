import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**", // Allows all image paths from this host
      },
      { 
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**", // Allows all image paths from this host
      }
    ],
  },
  async redirects() {
    return [
      {
        source: "/verify-email/:token",
        destination: "http://localhost:4000/api/users/verify-email/:token",
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
