import type { LLMProvider, LLMCompleteOptions, LLMProviderConfig } from '../provider';
import { redact } from '../redact';

export function anthropicProvider(cfg: LLMProviderConfig): LLMProvider {
  const apiKey = cfg.apiKey;
  const model = cfg.model ?? 'claude-3-5-sonnet-latest';
  const headers = { 'content-type': 'application/json', 'x-api-key': apiKey ?? '', 'anthropic-version': '2023-06-01' };
  function body(opts: LLMCompleteOptions, stream: boolean): string {
    return JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.7,
      system: opts.system ? redact(opts.system) : undefined,
      messages: opts.messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: redact(m.content) })),
      stream,
    });
  }
  return {
    name: `anthropic:${model}`,
    async complete(opts: LLMCompleteOptions): Promise<string> {
      if (!apiKey) throw new Error('未配置 API Key —— 请到「设置 · AI 配置」选择服务商并填写密钥');
      const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: body(opts, false) });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
      const data = (await res.json()) as { content?: Array<{ text?: string }> };
      return data.content?.[0]?.text ?? '';
    },
    async *stream(opts: LLMCompleteOptions): AsyncGenerator<string> {
      if (!apiKey) throw new Error('未配置 API Key —— 请到「设置 · AI 配置」选择服务商并填写密钥');
      const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: body(opts, true) });
      if (!res.ok || !res.body) throw new Error(`Anthropic ${res.status}: ${await res.text().catch(() => '')}`);
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
          if (!s.startsWith('data:')) continue;
          try {
            const j = JSON.parse(s.slice(5).trim()) as { type?: string; delta?: { type?: string; text?: string } };
            if (j.type === 'content_block_delta' && j.delta?.text) yield j.delta.text;
          } catch { /* partial */ }
        }
      }
    },
  };
}
