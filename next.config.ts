import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Proxy all /api/* requests to the backend
        source: "/api/:path*",
        destination: "http://localhost:5005/api/:path*",
      },
    ];
  },
};

export default nextConfig;
