import { createDocument } from "zod-openapi";
import type { ZodType } from "zod";
import { loginSchema, sessionResponseSchema } from "./features/auth/auth.dto.js";
import { balanceResponseSchema } from "./features/balance/balance.dto.js";
import { healthResponseSchema } from "./features/health/health.dto.js";
import { movementParamsSchema, movementQuerySchema, movementSchema, movementsResponseSchema } from "./features/movements/movements.dto.js";
import { errorResponseSchema } from "./shared/http.dto.js";

const json = (schema: ZodType) => ({
  "application/json": { schema },
});
const unauthorized = { description: "No active session", content: json(errorResponseSchema) };
const forbidden = { description: "Origin not allowed", content: json(errorResponseSchema) };

export const openapiDocument = createDocument({
  openapi: "3.1.0",
  info: { title: "GranaBank API", version: "1.0.0" },
  components: {
    securitySchemes: { sessionCookie: { type: "apiKey", in: "cookie", name: "gb_session" } },
  },
  paths: {
    "/health": {
      get: {
        operationId: "getHealth",
        responses: {
          200: {
            description: "API available",
            content: { "application/json": { schema: healthResponseSchema } },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        operationId: "login",
        requestBody: { required: true, content: json(loginSchema) },
        responses: {
          200: { description: "Session created", content: json(sessionResponseSchema) },
          400: { description: "Invalid login data", content: json(errorResponseSchema) },
          401: { description: "Invalid credentials", content: json(errorResponseSchema) },
          403: forbidden,
        },
      },
    },
    "/auth/me": {
      get: {
        operationId: "getSession",
        security: [{ sessionCookie: [] }],
        responses: { 200: { description: "Current user", content: json(sessionResponseSchema) }, 401: unauthorized },
      },
    },
    "/auth/logout": {
      post: {
        operationId: "logout",
        security: [{ sessionCookie: [] }],
        responses: { 204: { description: "Session revoked" }, 401: unauthorized, 403: forbidden },
      },
    },
    "/balance": {
      get: {
        operationId: "getBalance",
        security: [{ sessionCookie: [] }],
        responses: { 200: { description: "Current balance", content: json(balanceResponseSchema) }, 401: unauthorized },
      },
    },
    "/movements": {
      get: {
        operationId: "getMovements",
        security: [{ sessionCookie: [] }],
        requestParams: { query: movementQuerySchema },
        responses: {
          200: { description: "User movements, newest first", content: json(movementsResponseSchema) },
          400: { description: "Invalid filters", content: json(errorResponseSchema) },
          401: unauthorized,
        },
      },
    },
    "/movements/{id}": {
      get: {
        operationId: "getMovement",
        security: [{ sessionCookie: [] }],
        requestParams: { path: movementParamsSchema },
        responses: {
          200: { description: "User movement", content: json(movementSchema) },
          400: { description: "Invalid movement ID", content: json(errorResponseSchema) },
          401: unauthorized,
          404: { description: "Movement not found", content: json(errorResponseSchema) },
        },
      },
    },
  },
});
