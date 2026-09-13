// 服务商预设：友好名 → 接口类型 + 默认 base_url + 默认模型 + 取 key 的地址。
// GPT / DeepSeek / Kimi / GLM 都是 OpenAI 兼容的 /chat/completions，只是 base_url 与模型不同；
// Claude 走 Anthropic 自有协议。买家在界面里选其一并填自己的 key。
export type ProviderKind = 'anthropic' | 'openai';

export interface ProviderPreset {
  id: string;
  label: string;
  kind: ProviderKind;
  baseUrl?: string; // openai 兼容需要；anthropic 不需要
  defaultModel: string;
  keyHint: string; // 去哪里申请 key
  note?: string;
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  { id: 'deepseek', label: 'DeepSeek', kind: 'openai', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat', keyHint: 'platform.deepseek.com', note: '性价比高，中文强' },
  { id: 'openai', label: 'OpenAI · GPT', kind: 'openai', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini', keyHint: 'platform.openai.com' },
  { id: 'claude', label: 'Claude · Anthropic', kind: 'anthropic', defaultModel: 'claude-3-5-sonnet-latest', keyHint: 'console.anthropic.com' },
  { id: 'kimi', label: 'Kimi · Moonshot', kind: 'openai', baseUrl: 'https://api.moonshot.cn/v1', defaultModel: 'moonshot-v1-8k', keyHint: 'platform.moonshot.cn', note: '长上下文' },
  { id: 'glm', label: 'GLM · 智谱', kind: 'openai', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', defaultModel: 'glm-4-flash', keyHint: 'open.bigmodel.cn', note: 'glm-4-flash 免费额度' },
];

export function getPreset(id?: string | null): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id);
}
