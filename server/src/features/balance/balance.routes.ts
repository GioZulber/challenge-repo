import { Router } from "express";
import type { PrismaClient } from "../../generated/prisma/client.js";
import type { AuthService } from "../auth/auth.service.js";
import { createBalanceController } from "./balance.controller.js";

export function createBalanceRoutes(auth: AuthService, prisma: PrismaClient) {
  const router = Router();
  router.get("/", createBalanceController(auth, prisma));
  return router;
}
