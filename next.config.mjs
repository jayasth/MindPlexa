import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@ai-sdk/anthropic']
  },
  webpack: (config) => {
    config.resolve.alias['@'] = resolve(__dirname, '.');
    config.module.rules.push({
      test: /\.node$/,
      use: 'file-loader'
    });
    return config;
  },
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_DOMAIN || '*'
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
      },
      {
        source: '/api/completion',
        headers: [{ key: 'x-vercel-function-duration', value: '60' }]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'mindplexa.com'
          }
        ],
        destination: 'https://mindplexa.com/:path*',
        permanent: true
      }
    ];
  }
};

export default withBundleAnalyzer(nextConfig);
