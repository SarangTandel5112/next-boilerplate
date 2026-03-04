import type { NextRequest, NextResponse } from 'next/server';
import { Env } from '@/shared/config/env';

export const SESSION_COOKIE_NAME = 'session_token';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type SessionPayload = {
  userId: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
};

const toBase64Url = (value: string) => {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));

  return atob(base64 + padding);
};

const getSessionSecrets = () => {
  const primarySecret = Env.AUTH_SESSION_SECRET?.trim();
  const previousSecrets = Env.AUTH_SESSION_PREVIOUS_SECRETS
    ?.split(',')
    .map(secret => secret.trim())
    .filter(Boolean)
    ?? [];

  if (primarySecret) {
    return [primarySecret, ...previousSecrets];
  }

  if (Env.NODE_ENV === 'production') {
    throw new Error('[Auth] AUTH_SESSION_SECRET is required in production');
  }

  return ['local-development-session-secret-change-me-1234'];
};

const signSegment = async (segment: string, secret: string) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(segment));
  const bytes = Array.from(new Uint8Array(signature));
  const binary = String.fromCharCode(...bytes);

  return toBase64Url(binary);
};

const decodePayload = (payloadSegment: string): SessionPayload | null => {
  try {
    const rawPayload = fromBase64Url(payloadSegment);
    const parsed = JSON.parse(rawPayload) as SessionPayload;

    if (
      typeof parsed.userId !== 'string'
      || typeof parsed.role !== 'string'
      || typeof parsed.issuedAt !== 'number'
      || typeof parsed.expiresAt !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const buildSessionPayload = (options: { userId: string; role: string }): SessionPayload => {
  const issuedAt = Date.now();

  return {
    userId: options.userId,
    role: options.role,
    issuedAt,
    expiresAt: issuedAt + SESSION_MAX_AGE_SECONDS * 1000,
  };
};

export const createSessionToken = async (payload: SessionPayload) => {
  const payloadSegment = toBase64Url(JSON.stringify(payload));
  const [primarySecret] = getSessionSecrets();

  if (!primarySecret) {
    throw new Error('[Auth] Missing session signing secret');
  }

  const signature = await signSegment(payloadSegment, primarySecret);

  return `${payloadSegment}.${signature}`;
};

export const verifySessionToken = async (token?: string | null): Promise<SessionPayload | null> => {
  if (!token) {
    return null;
  }

  const [payloadSegment, signatureSegment] = token.split('.');

  if (!payloadSegment || !signatureSegment) {
    return null;
  }

  const payload = decodePayload(payloadSegment);

  if (!payload || payload.expiresAt <= Date.now()) {
    return null;
  }

  const secrets = getSessionSecrets();
  const signatures = await Promise.all(secrets.map(secret => signSegment(payloadSegment, secret)));

  if (signatures.includes(signatureSegment)) {
    return payload;
  }

  return null;
};

export const setSessionCookie = (response: NextResponse, token: string) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: Env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const clearSessionCookie = (response: NextResponse) => {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: Env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
};

export const getSessionTokenFromRequest = (request: NextRequest) => {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value;
};
