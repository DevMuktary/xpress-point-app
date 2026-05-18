/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // CRITICAL FIX: Compiles a lightweight Node server for Railway
};

export default nextConfig;
