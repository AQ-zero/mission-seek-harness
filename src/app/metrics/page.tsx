// TARGET: src/app/metrics/page.tsx  (NEW FILE)
import Link from 'next/link';
import { getLang } from '@/lib/i18n/server';
import { getFunnel, getAnonymousStats } from '@/lib/telemetry';
import { CopyStats } from './copy-stats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800">
      <div className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-1 font-serif text-2xl text-neutral-900 dark:text-neutral-100">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-neutral-400">{sub}</div>}
    </div>
  );
}

export default function MetricsPage() {
  const zh = getLang() === 'zh';
  const f = getFunnel();
  const stats = getAnonymousStats();
  const json = JSON.stringify(stats, null, 2);
  const yes = zh ? '是' : 'Yes';
  const no = zh ? '否' : 'No';
  const panel = 'mt-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800';

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-500">
            {zh ? '使用情况 · 仅本地' : 'Usage · local only'}
          </div>
          <h1 className="mt-1 text-2xl font-bold">{zh ? '度量底座' : 'Measurement base'}</h1>
        </div>
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">
          &larr; Dashboard
        </Link>
      </div>
      <p className="mt-2 max-w-[64ch] text-sm text-neutral-500">
        {zh
          ? '这些数字只存在你本机的数据库里，不含任何标题或正文，也永不自动上传。只有你在下方主动复制、发出去时，匿名统计才会离开这台机器。'
          : 'These numbers live only in your local database — no titles, no content — and are never auto-uploaded. The anonymous summary leaves this machine only if you copy it below and send it.'}
      </p>

      {!f.hasData && (
        <p className="mt-6 rounded-2xl border border-amber-600/30 bg-amber-500/[0.06] p-5 text-sm text-neutral-600 dark:text-neutral-300">
          {zh ? '还没有事件——用几天后再回来看。' : 'No events yet — come back after using it for a few days.'}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile
          label={zh ? '激活' : 'Activated'}
          value={f.activated ? yes : no}
          sub={f.daysToActivate != null ? (zh ? `第 ${f.daysToActivate} 天` : `day ${f.daysToActivate}`) : undefined}
        />
        <Tile label={zh ? '回访' : 'Returned'} value={f.returned ? yes : no} />
        <Tile
          label={zh ? '活跃天数' : 'Active days'}
          value={String(f.activeDays)}
          sub={f.spanDays ? (zh ? `共 ${f.spanDays} 天内` : `of ${f.spanDays}`) : undefined}
        />
        <Tile
          label={zh ? '周复盘' : 'Weekly reviews'}
          value={String(f.reviewsCompleted)}
          sub={f.weeksSinceFirst ? `/ ${f.weeksSinceFirst} ${zh ? '周' : 'wk'}` : undefined}
        />
        <Tile label={zh ? '北极星累计' : 'North Star'} value={String(f.northStarTotal)} sub={zh ? '因系统做成的事' : 'real things done'} />
        <Tile
          label={zh ? '决策' : 'Decisions'}
          value={String(stats.decisionsCreated)}
          sub={`${stats.decisionsResolved} ${zh ? '已对账' : 'resolved'}`}
        />
        <Tile label={zh ? '使命信号' : 'Signals'} value={String(stats.signalsCaptured)} />
        <Tile label={zh ? '打开次数' : 'Opens'} value={String(stats.appOpens)} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{zh ? '事件明细' : 'Events by type'}</h2>
        <div className={panel}>
          {f.byName.length ? (
            <ul className="space-y-1.5">
              {f.byName.map((b) => (
                <li key={b.name} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-[12px] text-neutral-500">{b.name}</span>
                  <span className="font-mono text-neutral-800 dark:text-neutral-200">{b.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-[13px] text-neutral-400">{zh ? '暂无' : 'Nothing yet'}</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">{zh ? '匿名统计（可分享）' : 'Anonymous summary (shareable)'}</h2>
        <div className={panel}>
          <p className="text-[13px] text-neutral-500">
            {zh
              ? '一个随机匿名 ID + 上面这些计数，不含任何能识别你或你写下内容的信息。愿意帮忙的话，复制发给作者，用来改进产品。'
              : 'A random anonymous ID plus the counts above — nothing that identifies you or anything you wrote. If you are willing, copy it and send it to the author to help improve the product.'}
          </p>
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-neutral-50 p-3 font-mono text-[11px] leading-relaxed text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
            {json}
          </pre>
          <div className="mt-3">
            <CopyStats
              json={json}
              labelCopy={zh ? '复制匿名统计' : 'Copy anonymous summary'}
              labelDone={zh ? '已复制 ✓' : 'Copied ✓'}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
