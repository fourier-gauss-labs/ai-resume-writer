// next.config.ts
import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Firebase Hosting static export
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Add any other Next.js config options here
  // For example:
  // reactStrictMode: true,
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Add this line
})(nextConfig);