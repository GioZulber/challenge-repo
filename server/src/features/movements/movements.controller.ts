import type { Request, Response } from "express";
import { errorResponseSchema } from "../../shared/http.dto.js";
import type { AuthService } from "../auth/auth.service.js";
import { movementParamsSchema, movementQuerySchema, movementSchema, movementsResponseSchema } from "./movements.dto.js";
import type { MovementsService } from "./movements.service.js";

export function createMovementsController(auth: AuthService, service: MovementsService) {
  return {
    async list(request: Request, response: Response) {
      const session = await auth.currentSession(request.get("cookie"));
      if (!session) return response.status(401).json(errorResponseSchema.parse({ error: "Unauthorized" }));
      const query = movementQuerySchema.safeParse(request.query);
      if (!query.success) return response.status(400).json(errorResponseSchema.parse({ error: "Invalid filters" }));

      const movements = await service.list(session.user.id, query.data);
      return response.json(movementsResponseSchema.parse({ movements }));
    },

    async detail(request: Request, response: Response) {
      const session = await auth.currentSession(request.get("cookie"));
      if (!session) return response.status(401).json(errorResponseSchema.parse({ error: "Unauthorized" }));
      const params = movementParamsSchema.safeParse(request.params);
      if (!params.success) return response.status(400).json(errorResponseSchema.parse({ error: "Invalid movement ID" }));

      const movement = await service.findById(session.user.id, params.data.id);
      if (!movement) return response.status(404).json(errorResponseSchema.parse({ error: "Movement not found" }));
      return response.json(movementSchema.parse(movement));
    },
  };
}
