import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'dashboard_session';
const JWT_SECRET = process.env.DASHBOARD_JWT_SECRET || 'inselbahn-dashboard-secret-change-me';
const JWT_EXPIRY_HOURS = 12;

interface JWTPayload {
  staff_id: string;
  name: string;
  role: string;
  exp: number;
  iat: number;
}

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY_HOURS * 3600,
  };

  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: JWTPayload = JSON.parse(
      Buffer.from(body, 'base64url').toString()
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function verifyPin(hash: string, pin: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function createSession(
  staffId: string,
  name: string,
  role: string
): Promise<string> {
  const token = createJWT({ staff_id: staffId, name, role });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: JWT_EXPIRY_HOURS * 3600,
    path: '/',
  });

  return token;
}

export function verifySession(
  cookieValue: string
): JWTPayload | null {
  return verifyJWT(cookieValue);
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;
  return verifySession(cookie.value);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
export type { JWTPayload };
