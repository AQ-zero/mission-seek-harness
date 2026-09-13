import type { LLMProvider, LLMCompleteOptions, LLMProviderConfig } from '../provider';

export function ollamaProvider(cfg: LLMProviderConfig): LLMProvider {
  const baseUrl = cfg.baseUrl ?? 'http://127.0.0.1:11434';
  const model = cfg.model ?? 'llama3.1';
  function msgs(opts: LLMCompleteOptions) {
    return [...(opts.system ? [{ role: 'system' as const, content: opts.system }] : []), ...opts.messages];
  }
  return {
    name: `ollama:${model}`,
    async complete(opts: LLMCompleteOptions): Promise<string> {
      const res = await fetch(`${baseUrl}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model, messages: msgs(opts), stream: false, options: { temperature: opts.temperature ?? 0.7 } }) });
      if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
      const data = (await res.json()) as { message?: { content?: string } };
      return data.message?.content ?? '';
    },
    async *stream(opts: LLMCompleteOptions): AsyncGenerator<string> {
      const res = await fetch(`${baseUrl}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model, messages: msgs(opts), stream: true, options: { temperature: opts.temperature ?? 0.7 } }) });
      if (!res.ok || !res.body) throw new Error(`Ollama ${res.status}: ${await res.text().catch(() => '')}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          const s = line.trim();
          if (!s) continue;
          try {
            const j = JSON.parse(s) as { message?: { content?: string }; done?: boolean };
            if (j.message?.content) yield j.message.content;
            if (j.done) return;
          } catch { /* partial */ }
        }
      }
    },
  };
}
