import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add any additional Next.js configuration options
  // ...

  webpack: (config) => {
    config.resolve.alias['@'] = resolve(__dirname, '.');
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:3000/socket.io/:path*'
      }
    ];
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:3000' // replace with your origin
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
