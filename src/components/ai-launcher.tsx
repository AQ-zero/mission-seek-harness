'use client';

import { useEffect, useRef, useState } from 'react';
import { useT, useLang } from '@/lib/i18n/client';

type Msg = { role: 'user' | 'assistant'; content: string };

function Mascot({ small }: { small?: boolean }) {
  const s = small ? 22 : 30;
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" className={small ? '' : 'pos-bob'} aria-hidden="true">
      <circle cx="20" cy="20" r="15" fill="#2E5A49" />
      <path className={small ? '' : 'pos-tw'} d="M31 8 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z" fill="#E6C77E" />
      <g fill="#F2F0EA">
        <circle className={small ? '' : 'pos-eye'} cx="14.5" cy="19" r="2.1" />
        <circle className={small ? '' : 'pos-eye'} cx="25.5" cy="19" r="2.1" />
      </g>
      <path d="M14.5 25 Q20 29 25.5 25" stroke="#F2F0EA" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function AiLauncher() {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => [{ role: 'assistant', content: t('ai.greeting') }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    const ERR = '[[POS_ERROR]]';
    const failMsg = (err: string) =>
      lang === 'zh'
        ? `（调用失败：${err}）请到「设置 · AI 配置」选择服务商并填写密钥。`
        : `(Call failed: ${err}) Go to Settings · AI to choose a provider and enter your key.`;
    try {
      const payload = next[0]?.role === 'assistant' ? next.slice(1) : next;
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setMessages((m) => [...m, { role: 'assistant', content: failMsg(j.error || '') }]);
        setLoading(false);
        return;
      }
      const ct = r.headers.get('content-type') || '';
      if (ct.includes('application/json') || !r.body) {
        const j = (await r.json()) as { ok?: boolean; reply?: string; error?: string };
        setMessages((m) => [...m, { role: 'assistant', content: j.ok ? j.reply || '' : failMsg(j.error || '') }]);
        setLoading(false);
        return;
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      let started = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const ei = acc.indexOf(ERR);
        const shown = ei >= 0 ? (acc.slice(0, ei).trimEnd() + '\n\n' + failMsg(acc.slice(ei + ERR.length).trim())).trim() : acc;
        if (!started) {
          started = true;
          setMessages((m) => [...m, { role: 'assistant', content: shown }]);
        } else {
          setMessages((m) => {
            const c = [...m];
            c[c.length - 1] = { role: 'assistant', content: shown };
            return c;
          });
        }
      }
      if (!started) setMessages((m) => [...m, { role: 'assistant', content: lang === 'zh' ? '（没有返回内容）' : '(No content returned)' }]);
      setLoading(false);
    } catch {
      const net = lang === 'zh' ? '（网络错误，稍后再试）' : '(Network error, try again later)';
      setMessages((m) => [...m, { role: 'assistant', content: net }]);
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(560px,72vh)] w-[min(384px,92vw)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_12px_48px_rgba(40,36,25,0.22)] dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex items-center gap-2.5 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <Mascot small />
            <div className="flex-1">
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{t('ai.title')}</div>
              <div className="text-[11px] text-neutral-400">{t('ai.subtitle')}</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label={t('common.close')} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">✕</button>
          </header>
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed ${m.role === 'user' ? 'bg-amber-600 text-white' : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-neutral-100 px-3.5 py-2 text-[13.5px] text-neutral-400 dark:bg-neutral-800">{t('ai.thinking')}</div>
              </div>
            )}
          </div>
          <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder={t('ai.placeholder')}
                className="max-h-28 flex-1 resize-none rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-[13.5px] text-neutral-900 outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
              <button onClick={send} disabled={loading || !input.trim()} className="rounded-xl bg-amber-600 px-3.5 py-2 text-[13px] font-semibold text-white transition disabled:opacity-40">
                {t('ai.send')}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('ai.launcher')}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_6px_24px_rgba(40,36,25,0.18)] ring-1 ring-neutral-200 transition hover:scale-[1.06] dark:bg-neutral-900 dark:ring-neutral-700"
      >
        {!open && <span className="pos-ring pointer-events-none absolute inset-0 rounded-full ring-2 ring-amber-500/40" />}
        <Mascot />
      </button>
    </>
  );
}
