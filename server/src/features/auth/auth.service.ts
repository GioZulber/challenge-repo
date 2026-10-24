import type { PrismaClient } from "../../generated/prisma/client.js";
import type { LoginDto } from "./auth.dto.js";
import { createAuthRepository } from "./auth.repository.js";
import { hashPassword, verifyPassword } from "./password.js";
import { newToken, SESSION_AGE_MS, tokenHash } from "./session.js";

const missingUserHash = hashPassword("missing-user");

export function createAuthService(prisma: PrismaClient) {
  const repository = createAuthRepository(prisma);

  async function currentSession(cookieHeader: string | undefined) {
    const token = cookieHeader?.match(/(?:^|;\s*)gb_session=([0-9a-f]{64})(?:;|$)/)?.[1];
    if (!token) return null;

    const hash = tokenHash(token);
    const session = await repository.findSession(hash);
    // shortcut: expired rows stay stored; add periodic cleanup if sessions grow.
    if (!session || session.expiresAt <= new Date()) return null;
    return { user: session.user, tokenHash: hash };
  }

  return {
    async login({ email, password }: LoginDto) {
      const user = await repository.findUser(email.trim().toLowerCase());
      const validPassword = verifyPassword(password, user?.passwordHash ?? missingUserHash);
      if (!user || !validPassword) return null;

      const token = newToken();
      await repository.createSession(user.id, tokenHash(token), new Date(Date.now() + SESSION_AGE_MS));
      return { user, token };
    },
    currentSession,
    logout: (session: NonNullable<Awaited<ReturnType<typeof currentSession>>>) =>
      repository.revokeSession(session.user.id, session.tokenHash),
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
