import type { LLMProvider, LLMCompleteOptions, LLMProviderConfig } from '../provider';
import { redact } from '../redact';

// OpenAI 兼容 /chat/completions —— GPT / DeepSeek / Kimi / GLM 共用，仅 baseUrl+model+key 不同。
export function openaiProvider(cfg: LLMProviderConfig): LLMProvider {
  const apiKey = cfg.apiKey;
  const model = cfg.model ?? 'gpt-4o-mini';
  const baseUrl = cfg.baseUrl ?? 'https://api.openai.com/v1';
  const headers = { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` };
  function body(opts: LLMCompleteOptions, stream: boolean): string {
    return JSON.stringify({
      model,
      messages: [
        ...(opts.system ? [{ role: 'system' as const, content: redact(opts.system) }] : []),
        ...opts.messages.map((m) => ({ role: m.role, content: redact(m.content) })),
      ],
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
      stream,
    });
  }
  const TIMEOUT_MS = 60_000;
  async function fetchT(url: string, init: RequestInit): Promise<Response> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      return await fetch(url, { ...init, signal: ctrl.signal });
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw new Error(`模型接口超时（>${TIMEOUT_MS / 1000}s）—— 检查网络/代理或稍后重试`);
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    name: `openai:${model}`,
    async complete(opts: LLMCompleteOptions): Promise<string> {
      if (!apiKey) throw new Error('未配置 API Key —— 请到「设置 · AI 配置」选择服务商并填写密钥');
      const res = await fetchT(`${baseUrl}/chat/completions`, { method: 'POST', headers, body: body(opts, false) });
      if (!res.ok) throw new Error(`模型接口 ${res.status}: ${await res.text()}`);
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content ?? '';
    },
    async *stream(opts: LLMCompleteOptions): AsyncGenerator<string> {
      if (!apiKey) throw new Error('未配置 API Key —— 请到「设置 · AI 配置」选择服务商并填写密钥');
      const res = await fetchT(`${baseUrl}/chat/completions`, { method: 'POST', headers, body: body(opts, true) });
      if (!res.ok || !res.body) throw new Error(`模型接口 ${res.status}: ${await res.text().catch(() => '')}`);
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
          const payload = s.slice(5).trim();
          if (payload === '[DONE]') return;
          try {
            const j = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> };
            const d = j.choices?.[0]?.delta?.content;
            if (d) yield d;
          } catch { /* partial line, wait for more */ }
        }
      }
    },
  };
}
