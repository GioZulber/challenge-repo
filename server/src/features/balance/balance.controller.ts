import type { Request, Response } from "express";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { errorResponseSchema } from "../../shared/http.dto.js";
import type { AuthService } from "../auth/auth.service.js";
import { balanceResponseSchema } from "./balance.dto.js";

export function createBalanceController(auth: AuthService, prisma: PrismaClient) {
  return async (request: Request, response: Response) => {
    const session = await auth.currentSession(request.get("cookie"));
    if (!session) return response.status(401).json(errorResponseSchema.parse({ error: "Unauthorized" }));
    const cards = await prisma.card.findMany({
      where: { userId: session.user.id },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { id: true, brand: true, last4: true, expires: true },
    });
    return response.json(balanceResponseSchema.parse({
      balanceCents: session.user.balanceCents,
      cards,
    }));
  };
}
