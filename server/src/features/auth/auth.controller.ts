import type { Request, Response } from "express";
import { errorResponseSchema } from "../../shared/http.dto.js";
import { loginSchema, sessionResponseSchema } from "./auth.dto.js";
import type { AuthService } from "./auth.service.js";
import { clearSessionCookie, isAllowedOrigin, setSessionCookie } from "./session.js";

export function createAuthController(service: AuthService) {
  return {
    async login(request: Request, response: Response) {
      if (!isAllowedOrigin(request)) return response.status(403).json(errorResponseSchema.parse({ error: "Origin not allowed" }));
      const body = loginSchema.safeParse(request.body);
      if (!body.success) return response.status(400).json(errorResponseSchema.parse({ error: "Invalid login data" }));

      const login = await service.login(body.data);
      if (!login) return response.status(401).json(errorResponseSchema.parse({ error: "Invalid credentials" }));
      setSessionCookie(response, login.token, body.data.remember ?? true);
      return response.json(sessionResponseSchema.parse({ user: login.user }));
    },

    async me(request: Request, response: Response) {
      const session = await service.currentSession(request.get("cookie"));
      if (!session) return response.status(401).json(errorResponseSchema.parse({ error: "Unauthorized" }));
      return response.json(sessionResponseSchema.parse({ user: session.user }));
    },

    async logout(request: Request, response: Response) {
      if (!isAllowedOrigin(request)) return response.status(403).json(errorResponseSchema.parse({ error: "Origin not allowed" }));
      const session = await service.currentSession(request.get("cookie"));
      if (!session) return response.status(401).json(errorResponseSchema.parse({ error: "Unauthorized" }));
      await service.logout(session);
      clearSessionCookie(response);
      return response.sendStatus(204);
    },
  };
}
