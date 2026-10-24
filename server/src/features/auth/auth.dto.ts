import * as z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(256),
  remember: z.boolean().optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
}).meta({ id: "User" });

export const sessionResponseSchema = z.object({ user: userSchema }).meta({ id: "SessionResponse" });
