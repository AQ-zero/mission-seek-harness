import { cookies } from 'next/headers';
import { LANG_COOKIE, normalizeLang, type Lang } from './config';
import { dict } from './dict';

export function getLang(): Lang {
  try {
    return normalizeLang(cookies().get(LANG_COOKIE)?.value);
  } catch {
    return 'en';
  }
}

export function getT(lang?: Lang): (k: string) => string {
  const l = lang ?? getLang();
  return (k: string) => dict[l][k] ?? dict.en[k] ?? k;
}
