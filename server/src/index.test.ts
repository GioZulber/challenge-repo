import assert from "node:assert/strict";
import test from "node:test";
import { healthResponseSchema } from "./features/health/health.dto.js";
import { createApp } from "./index.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import { openapiDocument } from "./openapi.js";

test("health endpoint responds without a database connection", async () => {
  const server = createApp({} as PrismaClient).listen(0);
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const response = await fetch(`http://localhost:${address.port}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(healthResponseSchema.parse(await response.json()), { status: "ok" });
    assert.ok(openapiDocument.paths["/health"]?.get?.responses?.[200]);
  } finally {
    server.close();
  }
});
