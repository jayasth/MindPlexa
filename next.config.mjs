/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any additional Next.js configuration options
  // ...

  async rewrites() {
    return [
      {
        source: "/socket.io/:path*",
        destination: "http://localhost:3000/socket.io/:path*",
      },
    ];
  },
};

export default nextConfig;
