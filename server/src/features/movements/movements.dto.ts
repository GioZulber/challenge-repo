import * as z from "zod";
import { MovementType } from "../../generated/prisma/enums.js";

export const movementSchema = z.object({
  id: z.string(),
  counterparty: z.string(),
  description: z.string(),
  amountCents: z.number().int(),
  type: z.enum(MovementType),
  createdAt: z.iso.datetime(),
}).meta({ id: "Movement" });

export const movementsResponseSchema = z.object({ movements: z.array(movementSchema) }).meta({ id: "MovementsResponse" });
export const movementQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  type: z.enum(MovementType).optional(),
});
export type MovementQueryDto = z.infer<typeof movementQuerySchema>;
export const movementParamsSchema = z.object({ id: z.string().min(1) });
