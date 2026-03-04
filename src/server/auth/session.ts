import type { NextRequest, NextResponse } from 'next/server';
import { Env, getSessionSigningSecrets } from '@/shared/config/env';
import { RBAC_ROLES } from './rbac';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type SessionPayload = {
  sub: string;
  role: typeof RBAC_ROLES.admin;
  iat: number;
  exp: number;
  jti: string;
};

type SigningKey = {
  kid: string;
  secret: string;
};

const signingKeyCache = new Map<string, Promise<CryptoKey>>();

const revokedSessionIds = new Set<string>();

const toBase64Url = (value: Uint8Array | string) => {
  const binary = typeof value === 'string'
    ? value
    : Array.from(value).map(byte => String.fromCharCode(byte)).join('');

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);

  return new Uint8Array(Array.from(binary, char => char.charCodeAt(0)));
};

const safeEqual = (left: string, right: string) => {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
};

const getSigningKeys = () => {
  return getSessionSigningSecrets().map((secret, index) => ({
    kid: index === 0 ? 'active' : `legacy-${index}`,
    secret,
  })) satisfies SigningKey[];
};

const getPrimarySigningKey = () => {
  const signingKeys = getSigningKeys();

  if (signingKeys.length === 0) {
    throw new Error('[Session] No signing keys configured');
  }

  return signingKeys[0]!;
};

const importSigningKey = async (secret: string) => {
  const cachedKey = signingKeyCache.get(secret);

  if (cachedKey) {
    return cachedKey;
  }

  const keyPromise = crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  signingKeyCache.set(secret, keyPromise);

  return keyPromise;
};

const signPayload = async (payloadEncoded: string, signingKey: SigningKey) => {
  const key = await importSigningKey(signingKey.secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadEncoded));

  return toBase64Url(new Uint8Array(signature));
};

const parseCookieHeader = (cookieHeader?: string | null) => {
  if (!cookieHeader) {
    return undefined;
  }

  const pair = cookieHeader
    .split(';')
    .map(item => item.trim())
    .find(item => item.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!pair) {
    return undefined;
  }

  return pair.slice(SESSION_COOKIE_NAME.length + 1);
};

const resolveTokenSigningKeys = (kid?: string) => {
  const signingKeys = getSigningKeys();

  if (!kid) {
    return signingKeys;
  }

  const matchedKey = signingKeys.find(item => item.kid === kid);

  return matchedKey ? [matchedKey] : [];
};

const isSessionPayloadValid = (payload: SessionPayload) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);

  if (!payload.sub || !payload.jti || !payload.exp || !payload.iat) {
    return false;
  }

  if (payload.role !== RBAC_ROLES.admin) {
    return false;
  }

  if (payload.exp <= nowInSeconds || payload.iat > nowInSeconds) {
    return false;
  }

  return true;
};

export const isSessionRevoked = async (jti: string) => {
  return revokedSessionIds.has(jti);
};

export const revokeSession = async (jti: string) => {
  revokedSessionIds.add(jti);
};

export const buildSessionPayload = (options: {
  userId: string;
  role?: typeof RBAC_ROLES.admin;
  ttlSeconds?: number;
}): SessionPayload => {
  const nowInSeconds = Math.floor(Date.now() / 1000);

  return {
    sub: options.userId,
    role: options.role ?? RBAC_ROLES.admin,
    iat: nowInSeconds,
    exp: nowInSeconds + (options.ttlSeconds ?? SESSION_TTL_SECONDS),
    jti: crypto.randomUUID(),
  };
};

export const createSessionToken = async (payload: SessionPayload) => {
  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signingKey = getPrimarySigningKey();
  const signature = await signPayload(payloadEncoded, signingKey);

  return `${signingKey.kid}.${payloadEncoded}.${signature}`;
};

export const verifySessionToken = async (token?: string) => {
  if (!token) {
    return null;
  }

  const parts = token.split('.');

  if (parts.length !== 2 && parts.length !== 3) {
    return null;
  }

  const [kidOrPayload, payloadOrSignature, maybeSignature] = parts;
  const hasKid = parts.length === 3;
  const kid = hasKid ? kidOrPayload : undefined;
  const payloadEncoded = hasKid ? payloadOrSignature : kidOrPayload;
  const signature = hasKid ? maybeSignature : payloadOrSignature;

  if (!payloadEncoded || !signature) {
    return null;
  }

  const candidateKeys = resolveTokenSigningKeys(kid);

  if (candidateKeys.length === 0) {
    return null;
  }

  let signatureMatched = false;

  for (const signingKey of candidateKeys) {
    const expectedSignature = await signPayload(payloadEncoded, signingKey);

    if (safeEqual(signature, expectedSignature)) {
      signatureMatched = true;
      break;
    }
  }

  if (!signatureMatched) {
    return null;
  }

  try {
    const payloadJson = decoder.decode(fromBase64Url(payloadEncoded));
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (!isSessionPayloadValid(payload)) {
      return null;
    }

    if (await isSessionRevoked(payload.jti)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

export const getSessionTokenFromRequest = (request: NextRequest | Request) => {
  if ('cookies' in request) {
    const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (cookieValue) {
      return cookieValue;
    }
  }

  return parseCookieHeader(request.headers.get('cookie'));
};

export const setSessionCookie = (response: NextResponse, token: string) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: Env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: Env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
};
