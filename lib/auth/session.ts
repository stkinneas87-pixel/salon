import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AUTH_AUDIENCE,
  AUTH_COOKIE_NAME,
  AUTH_ISSUER,
  AUTH_MAX_AGE_SECONDS,
} from "./constants";

export type AdminSession = {
  username: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function createSession(username: string) {
  const secret = getSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured");

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuer(AUTH_ISSUER)
    .setAudience(AUTH_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${AUTH_MAX_AGE_SECONDS}s`)
    .sign(secret);

  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<AdminSession | null> {
  const secret = getSecret();
  if (!secret) return null;

  const store = await cookies();
  const token = store.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    });

    if (!payload.sub) return null;
    return { username: payload.sub };
  } catch {
    return null;
  }
}

export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function assertAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function destroySession() {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}
