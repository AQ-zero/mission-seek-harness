// Prompts. Tone follows AGENTS.md: direct, no flattery, first-principles, willing to probe.
// Bilingual: each builder reads the current UI language (cookie) via getLang().
import { getLang } from '@/lib/i18n/server';

export function eulogySystem(): string {
  return getLang() === 'zh'
    ? '你是 MissionSeek 的助理，性格直接、不谄媚、遵循第一性原理。不安慰、不空洞夸奖；中文，简短有力；像一个诚实的老友，敢追问、敢点破。'
    : 'You are the MissionSeek assistant—direct, no flattery, first-principles. No coddling, no empty praise; answer in English, short and sharp; like an honest old friend who dares to probe and name things.';
}

export function eulogyReflectPrompt(text: string): string {
  if (getLang() === 'zh') {
    return '这是用户写的讣告草稿：\n\n"""' + text + '"""\n\n给出一个（最多两个）最锋利的追问，帮他分辨「真心想要」与「以为该写」。要求：直接、具体、扎心但善意；不要复述他的话；一段话，不超过 60 字。';
  }
  return 'Here is the user\'s eulogy draft:\n\n"""' + text + '"""\n\nGive one (at most two) of the sharpest follow-up questions to help them separate "what they truly want" from "what they think they should write." Be direct, specific, cutting but kind; do not restate their words; one paragraph, under 45 words.';
}

export function eulogyExtractPrompt(text: string): string {
  if (getLang() === 'zh') {
    return (
      '基于这份讣告草稿，提炼并「只输出 JSON」（不要解释、不要代码块、不要多余文字）：\n' +
      '{\n' +
      '  "remembered_for": ["3-5 条，他最想被记住的样子，每条不超过 14 字，动词开头"],\n' +
      '  "mission_hypotheses": ["1-2 条，从中推出的使命假设，每条一句话"]\n' +
      '}\n\n草稿：\n"""' + text + '"""'
    );
  }
  return (
    'From this eulogy draft, extract and OUTPUT JSON ONLY (no explanation, no code fence, no extra text):\n' +
    '{\n' +
    '  "remembered_for": ["3-5 items, how they most want to be remembered, each under ~7 words, verb-first"],\n' +
    '  "mission_hypotheses": ["1-2 items, mission hypotheses inferred from it, each one sentence"]\n' +
    '}\n\nDraft:\n"""' + text + '"""'
  );
}

export function threePerspectivesPrompt(
  d: { title: string; options: string[]; chosenOption?: string | null; predictedOutcome?: string | null; confidence?: number | null },
  northStar: string,
): string {
  const opts = (d.options || []).join(' / ');
  if (getLang() === 'zh') {
    return (
      '用户面临一个决策。请分别以「过去之我 / 现在之我 / 未来之我」三个时间视角，各给一段短评：每段不超过 45 字，中文，直接、不谄媚、允许互相冲突。\n' +
      '过去之我 = 更年轻、更莽撞也更纯粹的他；现在之我 = 权衡现实约束；未来之我 = 5 年后 / 临终回望。\n\n' +
      '他的北极星（用于校准方向，可引用）：' + (northStar || '（未设置）') + '\n\n' +
      '决策：' + d.title + '\n选项：' + opts + '\n倾向：' + (d.chosenOption || '未定') + '\n预测：' + (d.predictedOutcome || '—') + '（置信 ' + (d.confidence ?? '?') + '%）\n\n' +
      '只输出 JSON（无解释、无代码块）：{"past":"...","present":"...","future":"..."}'
    );
  }
  return (
    'The user faces a decision. Give a short take from each of three time-perspectives—"Past self / Present self / Future self": each under ~30 words, in English, direct, no flattery, allowed to conflict.\n' +
    'Past self = younger, more reckless but purer; Present self = weighing real constraints; Future self = 5 years out / looking back at the end.\n\n' +
    'Their North Star (to calibrate direction, may quote): ' + (northStar || '(not set)') + '\n\n' +
    'Decision: ' + d.title + '\nOptions: ' + opts + '\nLeaning: ' + (d.chosenOption || 'undecided') + '\nPrediction: ' + (d.predictedOutcome || '—') + ' (confidence ' + (d.confidence ?? '?') + '%)\n\n' +
    'Output JSON only (no explanation, no code fence): {"past":"...","present":"...","future":"..."}'
  );
}

export function signalReflectPrompt(kind: 'envy' | 'anger' | 'flow', text: string): string {
  if (getLang() === 'zh') {
    const map: Record<string, string> = {
      envy: '嫉妒（欲望地图——指向他想成为的样子）',
      anger: '愤怒（价值观边界——他在乎什么才会愤怒）',
      flow: '心流（天赋方向——什么让他忘记时间）',
    };
    return (
      '用户记了一条「' + map[kind] + '」信号：\n"""' + text + '"""\n' +
      '给一句话反问或线索，把它翻译成「这指向你想成为 / 在乎 / 擅长的什么」。要求：不超过 35 字，中文，直接、不谄媚、具体。只输出这一句话，不要引号。'
    );
  }
  const map: Record<string, string> = {
    envy: 'envy (a map of desire—points to who they want to become)',
    anger: 'anger (a boundary of values—what they care about enough to get angry)',
    flow: 'flow (a direction of talent—what makes them lose track of time)',
  };
  return (
    'The user logged a "' + map[kind] + '" signal:\n"""' + text + '"""\n' +
    'Give a one-line question or clue that translates it into "this points to who you want to become / what you care about / what you\'re good at." Under ~25 words, in English, direct, no flattery, specific. Output just that one line, no quotes.'
  );
}

export function missionSynthesisPrompt(signals: Array<{ kind: string; text: string; note?: string | null }>): string {
  if (getLang() === 'zh') {
    const lines = signals.map((s) => `[${s.kind}] ${s.text}` + (s.note ? `（线索：${s.note}）` : '')).join('\n');
    return (
      '下面是用户的一批使命信号（嫉妒/愤怒/心流）。请聚类，提炼出 1-3 条使命假设，并为每条附上支撑它的信号原文/要点作为证据。\n' +
      '只输出 JSON（无解释、无代码块）：\n' +
      '{ "hypotheses": [ { "statement": "一句话使命假设", "evidence": ["支撑的信号要点", "..."] } ] }\n\n' +
      '信号：\n' + lines
    );
  }
  const lines = signals.map((s) => `[${s.kind}] ${s.text}` + (s.note ? ` (clue: ${s.note})` : '')).join('\n');
  return (
    'Below is a batch of the user\'s mission signals (envy/anger/flow). Cluster them and distill 1-3 mission hypotheses, each with supporting signal excerpts/points as evidence.\n' +
    'Output JSON only (no explanation, no code fence):\n' +
    '{ "hypotheses": [ { "statement": "one-sentence mission hypothesis", "evidence": ["supporting signal point", "..."] } ] }\n\n' +
    'Signals:\n' + lines
  );
}

export function weeklyChallengePrompt(ctx: {
  newDecisions: number;
  resolvedThisWeek: number;
  dueNow: number;
  signalsThisWeek: number;
  northStar: string;
  recentDecisions: string[];
  lastActions: string[];
}): string {
  if (getLang() === 'zh') {
    return (
      '这是用户本周的数据快照。请生成 2-3 个最锋利的复盘追问，帮他别自我欺骗——针对数据里的矛盾（如：决策记了不少却没对账、信号很多却没转成行动、上周定的行动没做完、方向和北极星漂移）。要求：直接、具体、扎心但善意；中文，每条一句话。\n' +
      '只输出 JSON（无解释、无代码块）：{"questions":["...","..."]}\n\n' +
      '北极星：' + (ctx.northStar || '未设') + '\n' +
      '本周新决策 ' + ctx.newDecisions + ' · 本周已对账 ' + ctx.resolvedThisWeek + ' · 当前待对账 ' + ctx.dueNow + ' · 本周使命信号 ' + ctx.signalsThisWeek + '\n' +
      (ctx.lastActions.length ? '上周定的行动：' + ctx.lastActions.join(' / ') + '\n' : '') +
      (ctx.recentDecisions.length ? '最近决策：' + ctx.recentDecisions.join(' / ') : '')
    );
  }
  return (
    'Here is a snapshot of the user\'s week. Generate 2-3 of the sharpest review questions to keep them from self-deception—targeting contradictions in the data (e.g., logged many decisions but never reconciled them, many signals but none turned into action, last week\'s actions unfinished, direction drifting from the North Star). Direct, specific, cutting but kind; in English, each one sentence.\n' +
    'Output JSON only (no explanation, no code fence): {"questions":["...","..."]}\n\n' +
    'North Star: ' + (ctx.northStar || 'not set') + '\n' +
    'New decisions this week ' + ctx.newDecisions + ' · reconciled this week ' + ctx.resolvedThisWeek + ' · currently due ' + ctx.dueNow + ' · mission signals this week ' + ctx.signalsThisWeek + '\n' +
    (ctx.lastActions.length ? 'Actions set last week: ' + ctx.lastActions.join(' / ') + '\n' : '') +
    (ctx.recentDecisions.length ? 'Recent decisions: ' + ctx.recentDecisions.join(' / ') : '')
  );
}
