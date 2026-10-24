import type { PrismaClient } from "../../generated/prisma/client.js";

export function createAuthRepository(prisma: PrismaClient) {
  return {
    findUser: (email: string) => prisma.user.findUnique({ where: { email } }),
    createSession: (userId: string, hash: string, expiresAt: Date) => prisma.session.create({
      data: { tokenHash: hash, userId, expiresAt },
    }),
    findSession: (hash: string) => prisma.session.findUnique({
      where: { tokenHash: hash },
      include: { user: { select: { id: true, name: true, email: true, balanceCents: true, cardBrand: true, cardLast4: true, cardExpires: true } } },
    }),
    revokeSession: (userId: string, hash: string) => prisma.session.deleteMany({ where: { tokenHash: hash, userId } }),
  };
}
