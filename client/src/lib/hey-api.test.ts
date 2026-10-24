import assert from "node:assert/strict";
import test from "node:test";
import { ZodError } from "zod";
import { getBalance, getHealth } from "../generated/sdk.gen";

test("the generated SDK validates API responses", async () => {
  const fetchResponse = (body: unknown) =>
    getHealth({
      baseUrl: "https://example.test",
      fetch: async () => new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } }),
      throwOnError: true,
    });

  assert.deepEqual((await fetchResponse({ status: "ok" })).data, { status: "ok" });
  await assert.rejects(fetchResponse({ status: "broken" }), ZodError);
});

test("the generated balance SDK validates multiple cards", async () => {
  const fetchResponse = (cards: unknown) => getBalance({
    baseUrl: "https://example.test",
    fetch: async () => new Response(JSON.stringify({ balanceCents: 97885, cards }), { headers: { "Content-Type": "application/json" } }),
    throwOnError: true,
  });

  assert.deepEqual((await fetchResponse([
    { id: "mastercard", brand: "MASTERCARD", last4: "1234", expires: "02/30" },
    { id: "visa", brand: "VISA", last4: "5678", expires: "08/30" },
  ])).data?.cards.map((card) => card.brand), ["MASTERCARD", "VISA"]);
  assert.deepEqual((await fetchResponse([])).data?.cards, []);
  await assert.rejects(fetchResponse([{ id: "invalid", brand: "MASTERCARD", last4: "abc", expires: "02/30" }]), ZodError);
});
