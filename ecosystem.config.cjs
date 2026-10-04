/**
 * PM2 配置 —— gitxu 服务（自有 VPS 版）
 *
 * 与同机已有服务并存：
 *   airadar-service → 3000
 *   timiu-service   → 3001
 *   gitxu-service   → 3002
 *
 * 使用方法（在 /srv/gitxu 下）：
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *
 * ⚠️ 后台账号必须在这里注入：Next standalone 的 server.js **不会**从 cwd 读 .env
 *    （timiu 迁移时踩过，postbuild 里"已清理 .env / 由 PM2 注入"的注释就是错的）。
 *    缺了 ADMIN_* 会导致登录 500，连带管线发布全挂。
 */
module.exports = {
  apps: [
    {
      name: 'gitxu-service',

      // next build 产出的自包含 server.js（next.config.js → output: 'standalone'）
      script: '.next/standalone/server.js',
      cwd: '/srv/gitxu',

      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,

      // 英文镜像站，文章量级小于 timiu，给 400M 上限
      max_memory_restart: '400M',

      // 只监听本机，由 Nginx 反代；不直接对外暴露
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOSTNAME: '127.0.0.1',
        DATA_DIR: '/srv/gitxu/data',
        DB_FILE: '/srv/gitxu/data/gitxu.sqlite',
        ADMIN_USERNAME: 'winky',
        ADMIN_PASSWORD: '893398xu33',
      },

      error_file: '/var/log/gitxu/error.log',
      out_file: '/var/log/gitxu/out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
