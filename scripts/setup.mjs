// MissionSeek 一键初始化（跨平台，纯 Node，无依赖）
// 用法：npm run setup   或   node scripts/setup.mjs
import { execSync } from 'node:child_process';
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

function run(cmd, { optional = false } = {}) {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (e) {
    if (optional) {
      console.log('  (跳过：该步骤在本机不适用或已完成)');
      return false;
    }
    throw e;
  }
}

try {
  console.log('== MissionSeek 一键初始化 ==');

  // 1) 依赖（数据库为纯 WASM 的 sql.js，无需编译器 / 原生模块）
  run('npm install');

  // 2) 环境文件（不覆盖已存在的，保护你的 key）
  if (!existsSync('.env.local')) {
    copyFileSync('.env.example', '.env.local');
    console.log('\n✓ 已从 .env.example 生成 .env.local —— 记得填 AI key（见 README「配置 AI」）');
  } else {
    console.log('\n✓ .env.local 已存在，保留不动');
  }

  // 3) 会话密钥 AUTH_SECRET（启用登录；缺省=不启用）
  {
    let env = existsSync('.env.local') ? readFileSync('.env.local', 'utf8') : '';
    if (!/^AUTH_SECRET=.+/m.test(env)) {
      const sec = randomBytes(32).toString('hex');
      env += (env && !env.endsWith('\n') ? '\n' : '') + `AUTH_SECRET=${sec}\n`;
      writeFileSync('.env.local', env);
      console.log('\n✓ 已生成 AUTH_SECRET —— 登录已启用（首次访问将引导创建账户）');
    }
  }

  // 注：数据库表在应用启动时自动创建（幂等），无需 db:push。
  console.log('\n== 完成 ==');
  console.log('下一步：');
  console.log('  1) 编辑 .env.local 配置 AI，或进应用「设置 · AI 配置」填');
  console.log('  2) npm run dev  → http://localhost:3000');
} catch (e) {
  console.error('\n初始化中断：', (e && e.message) || e);
  process.exit(1);
}
