import "server-only";

import { and, count, eq, gt, lt } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { loginAttempts } from "@/lib/db/schema";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const memoryAttempts = new Map<string, number[]>();

function recentAttempts(key: string) {
  const now = Date.now();
  const values = (memoryAttempts.get(key) ?? []).filter(
    (time) => time > now - WINDOW_MS,
  );
  if (values.length) memoryAttempts.set(key, values);
  else memoryAttempts.delete(key);
  return values;
}

export async function isLoginRateLimited(ipHash: string) {
  const db = getDb();
  if (db) {
    try {
      const windowStart = new Date(Date.now() - WINDOW_MS);
      const [row] = await db
        .select({ value: count() })
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.ipHash, ipHash),
            gt(loginAttempts.attemptedAt, windowStart),
          ),
        );
      return (row?.value ?? 0) >= MAX_ATTEMPTS;
    } catch (error) {
      console.error("Login rate limit database check failed", error);
    }
  }

  return recentAttempts(ipHash).length >= MAX_ATTEMPTS;
}

export async function recordFailedLogin(ipHash: string) {
  const db = getDb();
  if (db) {
    try {
      await db.insert(loginAttempts).values({ ipHash });
      await db
        .delete(loginAttempts)
        .where(lt(loginAttempts.attemptedAt, new Date(Date.now() - 86_400_000)));
      return;
    } catch (error) {
      console.error("Login attempt could not be recorded", error);
    }
  }

  const values = recentAttempts(ipHash);
  values.push(Date.now());
  memoryAttempts.set(ipHash, values);
}

export async function clearLoginAttempts(ipHash: string) {
  const db = getDb();
  if (db) {
    try {
      await db.delete(loginAttempts).where(eq(loginAttempts.ipHash, ipHash));
    } catch (error) {
      console.error("Login attempts could not be cleared", error);
    }
  }
  memoryAttempts.delete(ipHash);
}
