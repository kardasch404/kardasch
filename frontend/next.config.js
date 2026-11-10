/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  reactStrictMode: false,
  experimental: { cpus: 2 },
}

module.exports = nextConfig
