import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "./features/auth/password.js";

test("password hashes are salted and verifiable", () => {
  const first = hashPassword("a demo password");
  const second = hashPassword("a demo password");
  assert.notEqual(first, second);
  assert.equal(verifyPassword("a demo password", first), true);
  assert.equal(verifyPassword("wrong password", first), false);
  assert.equal(verifyPassword("a demo password", "invalid"), false);
});
