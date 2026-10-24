import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Movement } from "../generated/types.gen";
import MovementDetailCard from "../screens/movements/MovementDetailCard";

test("movement detail shows signed amount and date in Argentina", () => {
  const movement: Movement = {
    id: "adobe", counterparty: "Adobe", description: "Pago de suscripción",
    type: "DEBIT_AUTO", amountCents: 12500, createdAt: "2026-10-20T01:00:00.000Z",
  };
  const html = renderToStaticMarkup(createElement(MovementDetailCard, { movement }));
  assert.match(html, /−\$125\.00/);
  assert.match(html, /Débito automático/);
  assert.match(html, /19\/10\/2026/);
  assert.match(html, /Pago de suscripción/);

  const received = renderToStaticMarkup(createElement(MovementDetailCard, { movement: { ...movement, type: "RECEIVED" } }));
  assert.match(received, /\+\$125\.00/);
});
