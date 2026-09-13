'use server';
import { getLang } from '@/lib/i18n/server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasAccount, getAccount, setAccount } from '@/db/queries';
import { hashPassword, verifyPassword } from '@/lib/hash';
import { signSession, SESSION_COOKIE } from '@/lib/session';

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET 未配置——请运行 npm run setup 生成');
  return s;
}

// 会话到「当日结束（下一个本地午夜）」过期：当天再次打开 cookie 仍在 → 免输入直接进；
// 跨天后 cookie 失效 → 每日首次打开需重新输入账户+密码。
function endOfTodayMs(): number {
  const d = new Date();
  d.setHours(24, 0, 0, 0); // 下一个本地午夜（用户本机时区，Electron 服务端即本机）
  return d.getTime();
}

async function issue(username: string): Promise<void> {
  const now = Date.now();
  const exp = endOfTodayMs();
  const token = await signSession({ u: username, iat: now, exp }, secret());
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(exp), // 到当日结束过期 → 每日首次需登录，当天免输入
  });
}

export async function registerAction(input: { username: string; password: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    if (hasAccount()) return { ok: false, error: getLang() === 'zh' ? '账户已存在，请直接登录' : 'Account already exists—just sign in' };
    const u = (input.username ?? '').trim();
    if (u.length < 2) return { ok: false, error: getLang() === 'zh' ? '用户名至少 2 个字符' : 'Username must be at least 2 characters' };
    if ((input.password ?? '').length < 6) return { ok: false, error: getLang() === 'zh' ? '密码至少 6 位' : 'Password must be at least 6 characters' };
    const { hash, salt } = hashPassword(input.password);
    setAccount(u, hash, salt);
    await issue(u);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function loginAction(input: { username: string; password: string }): Promise<{ ok: boolean; error?: string }> {
  try {
    const acc = getAccount();
    if (!acc) return { ok: false, error: getLang() === 'zh' ? '尚无账户，请先创建' : 'No account yet—create one first' };
    const u = (input.username ?? '').trim();
    if (u !== acc.username || !verifyPassword(input.password ?? '', acc.passHash, acc.passSalt)) {
      return { ok: false, error: getLang() === 'zh' ? '用户名或密码错误' : 'Wrong username or password' };
    }
    await issue(acc.username);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function logoutAction(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
  redirect('/login');
}
