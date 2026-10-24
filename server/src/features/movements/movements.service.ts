import type { PrismaClient } from "../../generated/prisma/client.js";
import type { MovementQueryDto } from "./movements.dto.js";
import { createMovementsRepository } from "./movements.repository.js";

export function createMovementsService(prisma: PrismaClient) {
  const repository = createMovementsRepository(prisma);
  return {
    async list(userId: string, query: MovementQueryDto) {
      const movements = await repository.list(userId, query);
      return movements.map((movement) => ({ ...movement, createdAt: movement.createdAt.toISOString() }));
    },
    async findById(userId: string, id: string) {
      const movement = await repository.findById(userId, id);
      return movement && { ...movement, createdAt: movement.createdAt.toISOString() };
    },
  };
}

export type MovementsService = ReturnType<typeof createMovementsService>;
