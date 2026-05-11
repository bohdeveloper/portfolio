/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Next.js NO soporta redirects() en modo export
  // Usar _redirects en Cloudflare en su lugar
};

module.exports = nextConfig;