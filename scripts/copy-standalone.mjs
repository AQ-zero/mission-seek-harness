// 把 .next/static 与 public 复制进 .next/standalone —— Next 的 standalone 输出不自动包含它们。
// 少了这一步：CSS/JS/静态资源全 404 → 页面裸奔、客户端交互失效。
import { cpSync, existsSync, mkdirSync } from 'node:fs';

const S = '.next/standalone';
if (!existsSync(S)) {
  console.error('✗ 缺少 .next/standalone —— 请确认 next.config 有 output:"standalone" 且已 next build');
  process.exit(1);
}
mkdirSync(`${S}/.next`, { recursive: true });
cpSync('.next/static', `${S}/.next/static`, { recursive: true });
if (existsSync('public')) cpSync('public', `${S}/public`, { recursive: true });
console.log('✓ 已复制 static/public 到 .next/standalone');
