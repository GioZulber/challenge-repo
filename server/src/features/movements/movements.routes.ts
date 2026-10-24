import { Router } from "express";
import type { AuthService } from "../auth/auth.service.js";
import { createMovementsController } from "./movements.controller.js";
import type { MovementsService } from "./movements.service.js";

export function createMovementsRoutes(auth: AuthService, service: MovementsService) {
  const router = Router();
  const controller = createMovementsController(auth, service);
  router.get("/", controller.list);
  router.get("/:id", controller.detail);
  return router;
}
