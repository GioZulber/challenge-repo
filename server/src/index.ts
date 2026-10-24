import express from "express";
import type { PrismaClient } from "./generated/prisma/client.js";
import { createAuthRoutes } from "./features/auth/auth.routes.js";
import { createAuthService } from "./features/auth/auth.service.js";
import { createBalanceRoutes } from "./features/balance/balance.routes.js";
import { healthRoutes } from "./features/health/health.routes.js";
import { createMovementsRoutes } from "./features/movements/movements.routes.js";
import { createMovementsService } from "./features/movements/movements.service.js";
import { errorResponseSchema } from "./shared/http.dto.js";

export function createApp(prisma: PrismaClient) {

  const app = express();
  const auth = createAuthService(prisma);
  app.use(express.json());

  app.use("/health", healthRoutes);
  app.use("/auth", createAuthRoutes(auth));
  app.use("/balance", createBalanceRoutes(auth, prisma));
  app.use("/movements", createMovementsRoutes(auth, createMovementsService(prisma)));


  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof SyntaxError && "body" in error) {
      return response.status(400).json(errorResponseSchema.parse({ error: "Invalid JSON" }));
    }
    console.error(error);
    return response.status(500).json(errorResponseSchema.parse({ error: "Internal server error" }));
  });

  return app;
}
