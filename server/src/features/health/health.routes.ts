import { Router } from "express";
import { healthResponseSchema } from "./health.dto.js";

export const healthRoutes = Router();

healthRoutes.get("/", (_request, response) => {
  response.json(healthResponseSchema.parse({ status: "ok" }));
});
