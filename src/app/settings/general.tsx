// TARGET: src/app/settings/general.tsx  (NEW FILE)
'use client';

import { useEffect, useRef, useState } from 'react';
import { saveProfileAction } from './actions';
import { useLang } from '@/lib/i18n/client';

const SCALES = ['sm', 'normal', 'lg', 'xl'] as const;
type Scale = (typeof SCALES)[number];

export function General({ name, username, avatar }: { name: string; username: string; avatar: string | null }) {
  const zh = useLang() === 'zh';
  const [nm, setNm] = useState(name || username || '');
  const [av, setAv] = useState<string | null>(avatar);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // theme + scale are per-device prefs read from the live DOM/localStorage (no server round-trip)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [scale, setScale] = useState<Scale>('normal');
  useEffect(() => {
    try {
      const tm = localStorage.getItem('pos-theme');
      setTheme(tm === 'dark' ? 'dark' : tm === 'light' ? 'light' : 'system');
      const s = localStorage.getItem('pos-scale') as Scale | null;
      setScale(s && SCALES.includes(s) ? s : 'normal');
    } catch {
      /* ignore */
    }
  }, []);

  function applyTheme(next: 'light' | 'dark' | 'system') {
    setTheme(next);
    const el = document.documentElement;
    try {
      if (next === 'system') {
        localStorage.removeItem('pos-theme');
        el.classList.toggle('dark', matchMedia('(prefers-color-scheme:dark)').matches);
      } else {
        localStorage.setItem('pos-theme', next);
        el.classList.toggle('dark', next === 'dark');
      }
    } catch {
      /* ignore */
    }
  }

  function applyScale(next: Scale) {
    setScale(next);
    const el = document.documentElement;
    if (next === 'normal') el.removeAttribute('data-scale');
    else el.setAttribute('data-scale', next);
    try {
      localStorage.setItem('pos-scale', next);
    } catch {
      /* ignore */
    }
  }

  function flash(m: string) {
    setSaved(m);
    setTimeout(() => setSaved(''), 1800);
  }

  async function pickAvatar(file: File) {
    setBusy(true);
    try {
      const dataUrl = await downscale(file, 128);
      setAv(dataUrl);
      await saveProfileAction({ avatar: dataUrl });
      flash(zh ? '已更新头像' : 'Avatar updated');
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }
  async function removeAvatar() {
    setBusy(true);
    setAv(null);
    await saveProfileAction({ avatar: null });
    setBusy(false);
    window.location.reload();
  }
  async function saveName() {
    setBusy(true);
    await saveProfileAction({ name: nm.trim() });
    setBusy(false);
    flash(zh ? '已保存' : 'Saved');
    window.location.reload();
  }

  const seg = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-[13px] transition ${
      active ? 'bg-amber-600 text-white' : 'border border-neutral-300 text-neutral-500 hover:border-amber-500 dark:border-neutral-700 dark:text-neutral-400'
    }`;
  const inp = 'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-neutral-700 dark:bg-neutral-900';

  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        {av ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={av} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="grid h-14 w-14 place-items-center rounded-full bg-amber-600 text-lg font-semibold text-white">
            {(nm || username || '·').slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-[13px] font-medium text-neutral-700 hover:border-amber-500 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
          >
            {zh ? '上传头像' : 'Upload avatar'}
          </button>
          {av && (
            <button onClick={removeAvatar} disabled={busy} className="rounded-lg px-3 py-1.5 text-[13px] text-neutral-400 hover:text-red-500 disabled:opacity-50">
              {zh ? '移除' : 'Remove'}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickAvatar(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Display name */}
      <div className="mt-5">
        <div className="mb-1 text-sm text-neutral-500">{zh ? '显示名称' : 'Display name'}</div>
        <div className="flex gap-2">
          <input value={nm} onChange={(e) => setNm(e.target.value)} placeholder={username || (zh ? '你的名字' : 'Your name')} className={inp} />
          <button onClick={saveName} disabled={busy || !nm.trim()} className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {zh ? '保存' : 'Save'}
          </button>
        </div>
      </div>

      {/* Appearance / theme */}
      <div className="mt-5">
        <div className="mb-1.5 text-sm text-neutral-500">{zh ? '外观' : 'Appearance'}</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => applyTheme('light')} className={seg(theme === 'light')}>{zh ? '浅色' : 'Light'}</button>
          <button onClick={() => applyTheme('dark')} className={seg(theme === 'dark')}>{zh ? '深色' : 'Dark'}</button>
          <button onClick={() => applyTheme('system')} className={seg(theme === 'system')}>{zh ? '跟随系统' : 'System'}</button>
        </div>
      </div>

      {/* Text size */}
      <div className="mt-5">
        <div className="mb-1.5 text-sm text-neutral-500">{zh ? '字体大小' : 'Text size'}</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => applyScale('sm')} className={seg(scale === 'sm')}>{zh ? '小' : 'Small'}</button>
          <button onClick={() => applyScale('normal')} className={seg(scale === 'normal')}>{zh ? '标准' : 'Normal'}</button>
          <button onClick={() => applyScale('lg')} className={seg(scale === 'lg')}>{zh ? '大' : 'Large'}</button>
          <button onClick={() => applyScale('xl')} className={seg(scale === 'xl')}>{zh ? '特大' : 'XL'}</button>
        </div>
      </div>

      {saved && <div className="mt-4 text-sm text-green-600">{saved}</div>}
    </div>
  );
}

// downscale a picked image to a square dataURL so the local DB stays small
async function downscale(file: File, size: number): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return url;
    const s = Math.min(img.width, img.height);
    const sx = (img.width - s) / 2;
    const sy = (img.height - s) / 2;
    ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
