/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-src 'self'",
  },
];

module.exports = {
  poweredByHeader: false,
  // 自包含 server.js：PM2 直接跑，服务器上不必装整套 node_modules
  output: 'standalone',
  // node-sqlite3-wasm 带 .wasm 资源，必须保持 external。
  // 不加这一行，webpack 会把 lib/db.ts 里的 createRequire 压成 undefined，
  // 运行时报 "n is not a function"（同机 timiu.com 踩过同一个坑）。
  // Next 14 里该选项还在 experimental 下，15+ 才是顶层 serverExternalPackages。
  experimental: {
    serverComponentsExternalPackages: ['node-sqlite3-wasm'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
