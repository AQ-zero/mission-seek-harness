export type LLMRole = 'system' | 'user' | 'assistant';

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface LLMCompleteOptions {
  messages: LLMMessage[];
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  readonly name: string;
  complete(opts: LLMCompleteOptions): Promise<string>;
  stream?(opts: LLMCompleteOptions): AsyncIterable<string>;
}

// 运行时解析出的单次配置（来自本地库设置或环境变量回退）
export interface LLMProviderConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export type LLMProviderName = 'anthropic' | 'openai' | 'ollama';
