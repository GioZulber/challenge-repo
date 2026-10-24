import { Router } from "express";
import type { AuthService } from "../auth/auth.service.js";
import { createBalanceController } from "./balance.controller.js";

export function createBalanceRoutes(auth: AuthService) {
  const router = Router();
  router.get("/", createBalanceController(auth));
  return router;
}
