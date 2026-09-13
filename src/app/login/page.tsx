import { redirect } from 'next/navigation';
import { hasAccount } from '@/db/queries';
import { LoginForm } from './login-form';
import { getT } from '@/lib/i18n/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  if (!hasAccount()) redirect('/setup');
  const t = getT();
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div aria-hidden className="auth-aura" />
      <div className="relative w-full max-w-sm">
        <div className="text-center">
          <div className="font-serif text-[34px] font-medium leading-none tracking-tight">
            <span className="auth-brand">MissionSeek</span>
            <span className="text-amber-600 dark:text-amber-500">.</span>
          </div>
          <p className="mt-3 text-sm text-neutral-500">{t('login.subtitle')}</p>
        </div>
        <div className="mt-8 rounded-2xl border border-neutral-200/70 bg-white/80 p-6 shadow-[0_1px_2px_rgba(40,36,25,0.03),0_24px_50px_-24px_rgba(40,36,25,0.20)] backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/70">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
