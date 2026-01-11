/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    console.log("Rewriting to:", process.env.BACKEND_URL || 'http://localhost:5000');
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
