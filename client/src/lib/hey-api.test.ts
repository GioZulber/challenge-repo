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

test("the generated balance SDK validates optional card metadata", async () => {
  const fetchResponse = (card: unknown) => getBalance({
    baseUrl: "https://example.test",
    fetch: async () => new Response(JSON.stringify({ balanceCents: 97885, card }), { headers: { "Content-Type": "application/json" } }),
    throwOnError: true,
  });

  assert.equal((await fetchResponse({ brand: "MASTERCARD", last4: "1234", expires: "02/30" })).data?.card?.last4, "1234");
  assert.equal((await fetchResponse(null)).data?.card, null);
  await assert.rejects(fetchResponse({ brand: "MASTERCARD", last4: "abc", expires: "02/30" }), ZodError);
});
