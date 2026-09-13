export type Lang = 'en' | 'zh';
export const DEFAULT_LANG: Lang = 'en';
export const LANG_COOKIE = 'pos-lang';
export function normalizeLang(v?: string | null): Lang {
  return v === 'zh' ? 'zh' : 'en';
}
