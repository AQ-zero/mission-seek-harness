import type { LLMProvider, LLMProviderName } from './provider';
import { anthropicProvider } from './providers/anthropic';
import { openaiProvider } from './providers/openai';
import { ollamaProvider } from './providers/ollama';
import { getPreset } from './presets';
import { getLlmSettings } from '@/db/queries';

// 解析顺序：① 界面内配置（本地库，买家自助）→ ② 环境变量回退（开发/高级）。
export function getLLM(): LLMProvider {
  const s = getLlmSettings();
  if (s?.providerId) {
    const preset = getPreset(s.providerId);
    const kind = preset?.kind ?? 'openai';
    const model = s.model || preset?.defaultModel;
    const baseUrl = s.baseUrl || preset?.baseUrl;
    if (kind === 'anthropic') return anthropicProvider({ apiKey: s.apiKey, model });
    return openaiProvider({ apiKey: s.apiKey, model, baseUrl });
  }

  const name = (process.env.LLM_PROVIDER ?? 'anthropic') as LLMProviderName;
  switch (name) {
    case 'anthropic':
      return anthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY, model: process.env.ANTHROPIC_MODEL });
    case 'openai':
      return openaiProvider({ apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL, baseUrl: process.env.OPENAI_BASE_URL });
    case 'ollama':
      return ollamaProvider({ baseUrl: process.env.OLLAMA_BASE_URL, model: process.env.OLLAMA_MODEL });
    default:
      throw new Error(`未知 LLM_PROVIDER: ${name}`);
  }
}

export * from './provider';
