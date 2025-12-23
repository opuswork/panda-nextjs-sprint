/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed rewrites - now using direct API routes with Prisma
  async rewrites() {
    return [
      {
        source: '/api/products/:path*',
        destination: 'http://localhost:3000/products/:path*',
      },
    ];
  },
};

export default nextConfig;
