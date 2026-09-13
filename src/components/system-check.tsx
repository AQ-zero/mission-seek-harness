'use client';

import { useState } from 'react';
import { useT, useLang } from '@/lib/i18n/client';

type Result = { ok: boolean; detail: string } | null;

export function SystemCheck() {
  const t = useT();
  const lang = useLang();
  const [db, setDb] = useState<Result>(null);
  const [ai, setAi] = useState<Result>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function checkDb() {
    setLoading('db');
    try {
      const r = await fetch('/api/health');
      const j = await r.json();
      const ok = lang === 'zh' ? `连接正常 · 表数 ${j.tables}` : `Connected · ${j.tables} tables`;
      setDb({ ok: !!j.ok, detail: j.ok ? ok : String(j.error) });
    } catch (e) {
      setDb({ ok: false, detail: String(e) });
    }
    setLoading(null);
  }

  async function checkAi() {
    setLoading('ai');
    try {
      const r = await fetch('/api/ai/test', { method: 'POST' });
      const j = await r.json();
      setAi({ ok: !!j.ok, detail: j.ok ? `${j.provider} → ${j.reply}` : String(j.error) });
    } catch (e) {
      setAi({ ok: false, detail: String(e) });
    }
    setLoading(null);
  }

  return (
    <div className="mt-8 space-y-3">
      <Row idle={t('sys.checkDb')} busy={t('sys.checking')} onRun={checkDb} loading={loading === 'db'} result={db} />
      <Row idle={t('sys.checkAi')} busy={t('sys.checking')} onRun={checkAi} loading={loading === 'ai'} result={ai} />
    </div>
  );
}

function Row({
  idle,
  busy,
  onRun,
  loading,
  result,
}: {
  idle: string;
  busy: string;
  onRun: () => void;
  loading: boolean;
  result: Result;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <button
        onClick={onRun}
        disabled={loading}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {loading ? busy : idle}
      </button>
      {result && (
        <span className={`text-sm ${result.ok ? 'text-green-600' : 'text-red-600'}`}>
          {result.ok ? '✓' : '✗'} {result.detail}
        </span>
      )}
    </div>
  );
}
