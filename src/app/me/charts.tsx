// 纯展示 SVG 图表（服务端可渲染，无第三方库）。色板延续「MissionSeek」：松绿/金/砂。
const PINE = '#2E5A49';
const GOLD = '#C7A86B';
const RED = '#C2564B';
const AXIS = 'rgba(120,120,120,0.25)';

export function CumLine({ data }: { data: { cum: number }[] }) {
  const W = 320, H = 120, pad = 10;
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.cum));
  const x = (i: number) => (n <= 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (n - 1));
  const y = (v: number) => H - pad - (v / max) * (H - 2 * pad);
  const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.cum).toFixed(1)}`).join(' ');
  const area = `${x(0).toFixed(1)},${H - pad} ${pts} ${x(n - 1).toFixed(1)},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="cumulative North Star">
      <polygon points={area} fill={PINE} fillOpacity="0.1" />
      <polyline points={pts} fill="none" stroke={PINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.cum)} r="2.4" fill={PINE} />
      ))}
    </svg>
  );
}

export function MonthHitBars({ data }: { data: { label: string; rate: number }[] }) {
  const W = 320, H = 122, pad = 10, base = H - 20;
  const n = data.length;
  const step = (W - 2 * pad) / n;
  const bw = Math.min(34, step - 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="hit rate by month">
      <line x1={pad} y1={base} x2={W - pad} y2={base} stroke={AXIS} />
      {data.map((d, i) => {
        const h = Math.max(2, d.rate * (base - pad));
        const cx = pad + step * i + step / 2;
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={base - h} width={bw} height={h} rx="2" fill={PINE} />
            <text x={cx} y={base + 12} textAnchor="middle" fontSize="8" fill="#8A8574">{d.label.slice(5)}</text>
            <text x={cx} y={base - h - 3} textAnchor="middle" fontSize="8" fill="#5A5647">{Math.round(d.rate * 100)}%</text>
          </g>
        );
      })}
    </svg>
  );
}

export function SignalStack({ data }: { data: { label: string; envy: number; anger: number; flow: number }[] }) {
  const W = 320, H = 122, pad = 10, base = H - 20;
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.envy + d.anger + d.flow));
  const step = (W - 2 * pad) / n;
  const bw = Math.min(28, step - 8);
  const color: Record<string, string> = { envy: GOLD, anger: RED, flow: PINE };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="signals by month">
      <line x1={pad} y1={base} x2={W - pad} y2={base} stroke={AXIS} />
      {data.map((d, i) => {
        const cx = pad + step * i + step / 2;
        const scale = (base - pad) / max;
        let top = base;
        const segs: Array<[string, number]> = [['flow', d.flow], ['anger', d.anger], ['envy', d.envy]];
        return (
          <g key={i}>
            {segs.map(([k, v]) => {
              const h = v * scale;
              top -= h;
              return h > 0 ? <rect key={k} x={cx - bw / 2} y={top} width={bw} height={h} fill={color[k]} /> : null;
            })}
            <text x={cx} y={base + 12} textAnchor="middle" fontSize="8" fill="#8A8574">{d.label.slice(5)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function ConfBars({ bins }: { bins: { label: string; predicted: number; actual: number; n: number }[] }) {
  const W = 320, H = 130, pad = 10, base = H - 22;
  const n = bins.length;
  const step = (W - 2 * pad) / n;
  const scale = (base - pad) / 100;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="calibration">
      <line x1={pad} y1={base} x2={W - pad} y2={base} stroke={AXIS} />
      {bins.map((b, i) => {
        const cx = pad + step * i + step / 2;
        const bw = Math.min(12, step / 3);
        const hp = b.predicted * scale;
        const ha = b.actual * scale;
        return (
          <g key={i}>
            <rect x={cx - bw - 1} y={base - hp} width={bw} height={hp} rx="1.5" fill={GOLD} />
            <rect x={cx + 1} y={base - ha} width={bw} height={ha} rx="1.5" fill={PINE} />
            <text x={cx} y={base + 12} textAnchor="middle" fontSize="8" fill="#8A8574">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
