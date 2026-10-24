import type { PrismaClient } from "../../generated/prisma/client.js";
import type { MovementQueryDto } from "./movements.dto.js";

export function createMovementsRepository(prisma: PrismaClient) {
  return {
    list: (userId: string, query: MovementQueryDto) => prisma.movement.findMany({
      where: {
        userId,
        ...(query.type && { type: query.type }),
        ...(query.q && {
          OR: [
            { counterparty: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    findById: (userId: string, id: string) => prisma.movement.findFirst({ where: { id, userId } }),
  };
}
