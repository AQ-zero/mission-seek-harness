// 脱敏钩子占位：发往云 API 前的上下文清洗。
// MVP 先直通；阶段四按规则实现（如去除人名/联系方式/敏感标签）。
export function redact(text: string): string {
  if (process.env.LLM_REDACT !== '1') return text;
  // TODO(阶段四): 实现脱敏规则
  return text;
}
