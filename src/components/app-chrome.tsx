// TARGET: src/components/app-chrome.tsx  (REPLACES existing — threads profile through to the sidebar)
'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { AiLauncher } from './ai-launcher';
import { ReviewReminder } from './review-reminder';
import type { Profile } from './account-menu';

const BARE = ['/login', '/setup'];

export function AppChrome({ children, profile }: { children: ReactNode; profile: Profile }) {
  const pathname = usePathname();
  if (BARE.includes(pathname)) return <>{children}</>; // 登录/创建账户：只留页面本身
  return (
    <>
      <Sidebar profile={profile} />
      <div className="md:pl-[248px]">{children}</div>
      <AiLauncher />
      <ReviewReminder />
    </>
  );
}
