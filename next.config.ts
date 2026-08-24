import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tradeslot-backend-nine.vercel.app/api/v1';
    // Handle base URL cleanly if user puts full /api/v1 path in env
    const targetBase = backendUrl.endsWith('/api/v1') 
      ? backendUrl.slice(0, -7) 
      : backendUrl.endsWith('/') 
        ? backendUrl.slice(0, -1) 
        : backendUrl;

    return [
      {
        source: '/api/v1/:path*',
        destination: `${targetBase}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
