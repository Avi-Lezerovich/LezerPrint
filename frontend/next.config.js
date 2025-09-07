/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_WS_URL: process.env.WS_URL || 'ws://localhost:3001',
  },
}

module.exports = nextConfig