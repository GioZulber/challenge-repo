import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "./generated/prisma/client.js";
import { MovementType } from "./generated/prisma/enums.js";
import { createApp } from "./index.js";
import { hashPassword } from "./features/auth/password.js";

test("sessions protect balance and movements and can be revoked", async (t) => {
  const users = [
    { id: "demo", name: "Granate", email: "demo@example.com", balanceCents: 97885, cardBrand: "MASTERCARD", cardLast4: "1234", cardExpires: "02/30", passwordHash: hashPassword("secret-demo") },
    { id: "other", name: "Other", email: "other@example.com", balanceCents: 0, cardBrand: null, cardLast4: null, cardExpires: null, passwordHash: hashPassword("secret-other") },
  ];
  const movements = [
    { id: "adobe", userId: "demo", counterparty: "Adobe", description: "Suscripción", type: MovementType.DEBIT_AUTO, amountCents: 12500, createdAt: new Date("2026-10-20T12:00:00Z") },
    { id: "salary", userId: "demo", counterparty: "Trabajo", description: "Ingreso", type: MovementType.RECEIVED, amountCents: 9500, createdAt: new Date("2026-10-19T12:00:00Z") },
    { id: "private", userId: "other", counterparty: "Private", description: "Another account", type: MovementType.SENT, amountCents: 100, createdAt: new Date("2026-10-18T12:00:00Z") },
  ];
  const sessions = new Map<string, { userId: string; expiresAt: Date }>();
  const db = {
    user: { findUnique: async ({ where }: { where: { email: string } }) => users.find((user) => user.email === where.email) ?? null },
    session: {
      create: async ({ data }: { data: { tokenHash: string; userId: string; expiresAt: Date } }) => {
        sessions.set(data.tokenHash, { userId: data.userId, expiresAt: data.expiresAt });
      },
      findUnique: async ({ where }: { where: { tokenHash: string } }) => {
        const session = sessions.get(where.tokenHash);
        return session ? { ...session, user: users.find((user) => user.id === session.userId)! } : null;
      },
      deleteMany: async ({ where }: { where: { tokenHash: string; userId: string } }) => {
        if (sessions.get(where.tokenHash)?.userId === where.userId) sessions.delete(where.tokenHash);
      },
    },
    movement: {
      findMany: async ({ where }: { where: { userId: string; type?: string; OR?: Array<{ counterparty?: { contains: string }; description?: { contains: string } }> } }) => movements.filter((movement) =>
        movement.userId === where.userId && (!where.type || movement.type === where.type) &&
        (!where.OR || where.OR.some((filter) =>
          movement.counterparty.toLowerCase().includes(filter.counterparty?.contains.toLowerCase() ?? "\0") ||
          movement.description.toLowerCase().includes(filter.description?.contains.toLowerCase() ?? "\0")))),
      findFirst: async ({ where }: { where: { id: string; userId: string } }) => movements.find((movement) => movement.id === where.id && movement.userId === where.userId) ?? null,
    },
  } as unknown as PrismaClient;

  const server = createApp(db).listen(0);
  t.after(() => server.close());
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://localhost:${address.port}`;
  const post = (path: string, body: unknown, origin = "http://localhost:3000") => fetch(`${base}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body),
  });

  assert.equal((await fetch(`${base}/balance`)).status, 401);
  assert.equal((await fetch(`${base}/movements`)).status, 401);
  assert.equal((await fetch(`${base}/movements/adobe`)).status, 401);
  assert.equal((await post("/auth/login", { email: "demo@example.com", password: "secret-demo" }, "https://evil.example")).status, 403);
  assert.equal((await fetch(`${base}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).status, 403);
  assert.equal((await post("/auth/login", { email: "demo@example.com", password: "wrong" })).status, 401);
  assert.equal((await post("/auth/login", { email: "missing@example.com", password: "secret-demo" })).status, 401);
  assert.equal((await post("/auth/login", { email: "not-an-email", password: "secret-demo" })).status, 400);
  assert.equal((await post("/auth/login", { email: "demo@example.com", password: "secret-demo", remember: "yes" })).status, 400);
  assert.equal((await fetch(`${base}/auth/login`, { method: "POST", headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" }, body: "{" })).status, 400);

  const login = await post("/auth/login", { email: "demo@example.com", password: "secret-demo" });
  assert.equal(login.status, 200);
  assert.deepEqual(await login.json(), { user: { id: "demo", name: "Granate", email: "demo@example.com" } });
  assert.match(login.headers.get("set-cookie") ?? "", /HttpOnly.*SameSite=Lax/);
  assert.match(login.headers.get("set-cookie") ?? "", /Max-Age=604800/);
  const browserSession = await post("/auth/login", { email: "demo@example.com", password: "secret-demo", remember: false });
  assert.equal(browserSession.status, 200);
  assert.doesNotMatch(browserSession.headers.get("set-cookie") ?? "", /Max-Age|Expires/);
  const rememberedSession = await post("/auth/login", { email: "demo@example.com", password: "secret-demo", remember: true });
  assert.match(rememberedSession.headers.get("set-cookie") ?? "", /Max-Age=604800/);
  const cookie = login.headers.get("set-cookie")!.split(";")[0];
  const get = (path: string, sessionCookie = cookie) => fetch(`${base}${path}`, { headers: { Cookie: sessionCookie } });

  assert.deepEqual(await (await get("/auth/me")).json(), { user: { id: "demo", name: "Granate", email: "demo@example.com" } });
  assert.deepEqual(await (await get("/balance")).json(), { balanceCents: 97885, card: { brand: "MASTERCARD", last4: "1234", expires: "02/30" } });
  assert.deepEqual((await (await get("/movements")).json()).movements.map((movement: { id: string }) => movement.id), ["adobe", "salary"]);
  assert.deepEqual((await (await get("/movements?q=suscripci%C3%B3n&type=DEBIT_AUTO")).json()).movements.map((movement: { id: string }) => movement.id), ["adobe"]);
  assert.equal((await get("/movements?type=INVALID")).status, 400);
  assert.equal((await (await get("/movements/adobe")).json()).createdAt, "2026-10-20T12:00:00.000Z");
  assert.equal((await get("/movements/private")).status, 404);
  assert.equal((await get("/movements/nonexistent")).status, 404);
  assert.equal((await get("/auth/me", "gb_session=invalid")).status, 401);

  const logout = (origin = "http://localhost:3000") => fetch(`${base}/auth/logout`, { method: "POST", headers: { Origin: origin, Cookie: cookie } });
  assert.equal((await logout("https://evil.example")).status, 403);
  assert.equal((await get("/auth/me")).status, 200);
  assert.equal((await logout()).status, 204);
  assert.equal((await get("/auth/me")).status, 401);
  assert.equal((await logout()).status, 401);

  const secondLogin = await post("/auth/login", { email: "other@example.com", password: "secret-other" });
  const otherCookie = secondLogin.headers.get("set-cookie")!.split(";")[0];
  assert.deepEqual(await (await get("/balance", otherCookie)).json(), { balanceCents: 0, card: null });
  assert.deepEqual((await (await get("/movements", otherCookie)).json()).movements.map((movement: { id: string }) => movement.id), ["private"]);
  assert.equal((await get("/movements/adobe", otherCookie)).status, 404);
  const session = [...sessions.values()].find((entry) => entry.userId === "other")!;
  session.expiresAt = new Date(0);
  assert.equal((await get("/auth/me", otherCookie)).status, 401);
  assert.equal((await get("/balance", otherCookie)).status, 401);
});
