'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { AiLauncher } from './ai-launcher';
import { ReviewReminder } from './review-reminder';

const BARE = ['/login', '/setup'];

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (BARE.includes(pathname)) return <>{children}</>; // 登录/创建账户：只留页面本身
  return (
    <>
      <Sidebar />
      <div className="md:pl-[248px]">{children}</div>
      <AiLauncher />
      <ReviewReminder />
    </>
  );
}
