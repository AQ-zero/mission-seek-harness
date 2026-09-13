// HMAC 会话令牌：Edge 中间件与 Node 服务端皆可用（Web Crypto，无 Node 专有 API）。
const enc = new TextEncoder();
const dec = new TextDecoder();

// 统一转成真正的 ArrayBuffer，避免 Uint8Array<ArrayBufferLike> 与 BufferSource 的类型不匹配。
function toBuf(u: Uint8Array): ArrayBuffer {
  const b = new ArrayBuffer(u.byteLength);
  new Uint8Array(b).set(u);
  return b;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', toBuf(enc.encode(secret)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export interface SessionPayload {
  u: string;
  iat: number;
  exp: number;
}

export const SESSION_COOKIE = 'pos_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 天

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
  const body = bytesToB64url(enc.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, toBuf(enc.encode(body))));
  return `${body}.${bytesToB64url(sig)}`;
}

export async function verifySession(token: string, secret: string): Promise<SessionPayload | null> {
  const dot = token.indexOf('.');
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, toBuf(b64urlToBytes(sig)), toBuf(enc.encode(body)));
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(b64urlToBytes(body))) as SessionPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
