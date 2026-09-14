// TARGET: src/app/layout.tsx  (REPLACES existing — reads profile for the account menu, +text-size boot script)
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AppChrome } from '@/components/app-chrome';
import { UsagePing } from '@/components/usage-ping'; // [telemetry]
import { getLang } from '@/lib/i18n/server';
import { LangProvider } from '@/lib/i18n/client';
import { getAccount, getSetting } from '@/db/queries';

export const metadata: Metadata = {
  title: 'MissionSeek',
  description: 'The compounding personal-growth system',
};

// theme (dark) + text size are applied before hydration to avoid a flash
const themeScript = `try{var t=localStorage.getItem('pos-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches;if(d)document.documentElement.classList.add('dark');var s=localStorage.getItem('pos-scale');if(s&&s!=='normal')document.documentElement.setAttribute('data-scale',s);}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  const lang = getLang();
  const acc = getAccount();
  const profile = {
    name: getSetting('profile.name') ?? '',
    username: acc?.username ?? '',
    avatar: getSetting('profile.avatar'),
  };
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <LangProvider lang={lang}>
          <UsagePing />
          <AppChrome profile={profile}>{children}</AppChrome>
        </LangProvider>
      </body>
    </html>
  );
}
