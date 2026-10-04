/**
 * postbuild —— 补齐 Next standalone 不会自己带走的三样东西
 * ==========================================================================
 * 运行 `npm run build` 后自动执行（见 package.json）。
 *
 * 1. `public/`                    —— 站点静态文件（favicon、robots 等）
 * 2. `.next/static/`              —— CSS / JS chunk，缺了页面就是纯 HTML 裸奔
 * 3. `node_modules/node-sqlite3-wasm` —— 该包由 lib/db.ts 通过 createRequire
 *    动态加载，Next 的依赖追踪看不见它，standalone 的 node_modules 里不会有。
 *    缺了它每次查询都抛 "n is not a function"，站点看起来只是"没文章"。
 */

import { cpSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const standalone = join(root, '.next', 'standalone');

if (!existsSync(standalone)) {
  console.error('postbuild: .next/standalone not found — did `next build` succeed?');
  process.exit(1);
}

function copy(from, to, label) {
  if (!existsSync(from)) {
    console.warn(`  skip  ${label} (not found: ${from})`);
    return;
  }
  mkdirSync(dirname(to), { recursive: true });
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`  ok    ${label}`);
}

console.log('postbuild: assembling standalone');
copy(join(root, 'public'), join(standalone, 'public'), 'public/');
copy(join(root, '.next', 'static'), join(standalone, '.next', 'static'), '.next/static/');

for (const dep of ['node-sqlite3-wasm']) {
  copy(join(root, 'node_modules', dep), join(standalone, 'node_modules', dep), `node_modules/${dep}`);
}

console.log('postbuild: done');
