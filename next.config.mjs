/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Não bloqueia o build; o typecheck roda separado (`npm run typecheck`).
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
