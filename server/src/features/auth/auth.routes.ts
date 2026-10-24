import { Router } from "express";
import { createAuthController } from "./auth.controller.js";
import type { AuthService } from "./auth.service.js";

export function createAuthRoutes(service: AuthService) {
  const router = Router();
  const controller = createAuthController(service);
  router.post("/login", controller.login);
  router.get("/me", controller.me);
  router.post("/logout", controller.logout);
  return router;
}
