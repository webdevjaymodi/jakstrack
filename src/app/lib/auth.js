import { hash, compare } from "bcryptjs";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

const SESSION_COOKIE = "session_token";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Hash a plain-text password with bcryptjs (12 rounds).
 */
export async function hashPassword(password) {
  return hash(password, 12);
}

/**
 * Verify a plain-text password against a bcryptjs hash.
 */
export async function verifyPassword(password, hashedPassword) {
  return compare(password, hashedPassword);
}

/**
 * Generate a cryptographically random session token.
 */
export function generateToken() {
  return randomUUID();
}

/**
 * Create a new session for the given userId, persist it in the DB,
 * and set an HTTP-only cookie.
 */
export async function createSession(userId) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return token;
}

/**
 * Delete the current session from the DB and clear the cookie.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE);

  if (tokenCookie?.value) {
    await prisma.session.deleteMany({
      where: { token: tokenCookie.value },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Get the currently authenticated user from the session cookie.
 * Returns the user object (id, name, email, role) or null.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE);

  if (!tokenCookie?.value) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: tokenCookie.value },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired or not found — clean up
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

/**
 * Require an authenticated user. Redirects to /login if not authenticated.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
