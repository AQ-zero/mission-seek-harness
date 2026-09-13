// TARGET: src/app/metrics/copy-stats.tsx  (NEW FILE)
'use client';

import { useState } from 'react';

export function CopyStats({ json, labelCopy, labelDone }: { json: string; labelCopy: string; labelDone: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(json);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* clipboard may be blocked; the JSON is shown above for manual selection */
    }
  }
  return (
    <button onClick={copy} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">
      {done ? labelDone : labelCopy}
    </button>
  );
}
