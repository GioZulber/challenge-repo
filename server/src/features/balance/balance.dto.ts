import * as z from "zod";

export const balanceResponseSchema = z.object({
  balanceCents: z.number().int(),
  card: z.object({
    brand: z.enum(["MASTERCARD", "VISA"]),
    last4: z.string().regex(/^\d{4}$/),
    expires: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
  }).nullable(),
}).meta({ id: "BalanceResponse" });
