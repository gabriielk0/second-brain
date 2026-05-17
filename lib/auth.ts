import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key',
);

export interface SessionPayload {
  userId: string;
  email: string;
  expiresAt: Date;
  [key: string]: unknown;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(email: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
  const session = await encrypt({ userId: 'user-1', email, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;

  if (!cookie) return null;

  const session = await decrypt(cookie);
  if (!session) return null;

  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const validEmail = process.env.AUTH_EMAIL;
  const validPassword = process.env.AUTH_PASSWORD;

  return email === validEmail && password === validPassword;
}
