import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

const PUBLIC = ['/login', '/setup', '/api/auth'];

// 中间件跑在 Edge 运行时，拿不到运行时才注入的会话密钥（桌面版由 electron 生成），
// 无法可靠地在这里验签。故此处只做"有无会话 cookie"的门禁——
// cookie 由服务端动作签发（httpOnly + 签名令牌，密码正确才发），对单机本地锁足够。
// （将来做对外多用户 Web 版时，改为在 Node 层做完整验签。）
export function middleware(req: NextRequest) {
  if (!process.env.AUTH_SECRET) return NextResponse.next(); // 未启用登录 = 开放

  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }
  if (req.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.next(); // 有会话即放行
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
