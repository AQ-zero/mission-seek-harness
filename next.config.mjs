/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 桌面封装需要：自包含 .next/standalone/server.js
  experimental: { serverComponentsExternalPackages: ['sql.js'] }, // sql.js 含 .wasm，走外部包按 node_modules 加载
};
export default nextConfig;
