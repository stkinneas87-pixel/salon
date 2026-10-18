"use server";

import { compare } from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getIpFromHeaders, hashIp } from "@/lib/auth/ip";
import {
  clearLoginAttempts,
  isLoginRateLimited,
  recordFailedLogin,
} from "@/lib/auth/rate-limit";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/content/schemas";

export type LoginState = {
  error?: string;
};

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter your username and password." };
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || !expectedHash || !process.env.AUTH_SECRET) {
    return {
      error:
        "Admin access is not configured yet. Set ADMIN_USERNAME, ADMIN_PASSWORD_HASH and AUTH_SECRET.",
    };
  }

  const requestHeaders = await headers();
  const ipHash = hashIp(getIpFromHeaders(requestHeaders));
  if (!ipHash) {
    return { error: "Admin session hashing is not configured. Check AUTH_SECRET." };
  }

  if (await isLoginRateLimited(ipHash)) {
    return {
      error: "Too many attempts. Please wait 15 minutes and try again.",
    };
  }

  const usernameMatches = safeEqual(parsed.data.username, expectedUsername);
  let passwordMatches = false;

  try {
    passwordMatches = await compare(parsed.data.password, expectedHash);
  } catch {
    passwordMatches = false;
  }

  if (!usernameMatches || !passwordMatches) {
    await recordFailedLogin(ipHash);
    return { error: "Those details don't match. Please try again." };
  }

  await clearLoginAttempts(ipHash);

  try {
    await createSession(parsed.data.username);
  } catch {
    return { error: "The admin session could not be created. Check AUTH_SECRET." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
