import * as z from "zod";

export const balanceResponseSchema = z.object({
  balanceCents: z.number().int(),
  cards: z.array(z.object({
    id: z.string(),
    brand: z.enum(["MASTERCARD", "VISA"]),
    last4: z.string().regex(/^\d{4}$/),
    expires: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
  })),
}).meta({ id: "BalanceResponse" });
