import type { Request, Response } from "express";
import { errorResponseSchema } from "../../shared/http.dto.js";
import type { AuthService } from "../auth/auth.service.js";
import { balanceResponseSchema } from "./balance.dto.js";

export function createBalanceController(auth: AuthService) {
  return async (request: Request, response: Response) => {
    const session = await auth.currentSession(request.get("cookie"));
    if (!session) return response.status(401).json(errorResponseSchema.parse({ error: "Unauthorized" }));
    const { balanceCents, cardBrand, cardLast4, cardExpires } = session.user;
    return response.json(balanceResponseSchema.parse({
      balanceCents,
      card: cardBrand && cardLast4 && cardExpires
        ? { brand: cardBrand, last4: cardLast4, expires: cardExpires }
        : null,
    }));
  };
}
