import { createHash, randomBytes } from "node:crypto";
import type { Request, Response } from "express";

export const COOKIE_NAME = "gb_session";
export const SESSION_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export function setSessionCookie(response: Response, token: string, remember: boolean): void {
  response.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember && { maxAge: SESSION_AGE_MS }),
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function isAllowedOrigin(request: Request): boolean {
  // Next rewrites preserve the browser Origin, not the API server Host.
  return request.get("origin") === (process.env.CLIENT_ORIGIN ?? "http://localhost:3000");
}
