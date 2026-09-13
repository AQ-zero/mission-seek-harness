'use client';

import { useState, type FormEvent } from 'react';
import { registerAction } from '../login/actions';
import { useT } from '@/lib/i18n/client';

const inp =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 dark:border-neutral-700 dark:bg-neutral-900';

export function SetupForm() {
  const t = useT();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [p2, setP2] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (p !== p2) {
      setErr(t('setup.mismatch'));
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const r = await registerAction({ username: u, password: p });
      if (r.ok) {
        window.location.href = '/';
        return;
      }
      setErr(r.error ?? t('setup.createFail'));
    } catch (e2) {
      setErr(t('auth.submitFail') + ((e2 as Error).message || t('auth.unknownErr')));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input className={inp} placeholder={t('setup.usernamePh')} value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoFocus />
      <input className={inp} type="password" placeholder={t('setup.passwordPh')} value={p} onChange={(e) => setP(e.target.value)} autoComplete="new-password" />
      <input className={inp} type="password" placeholder={t('setup.password2Ph')} value={p2} onChange={(e) => setP2(e.target.value)} autoComplete="new-password" />
      <button disabled={loading} className="w-full rounded-lg bg-amber-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50">
        {loading ? t('setup.creating') : t('setup.createBtn')}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </form>
  );
}
