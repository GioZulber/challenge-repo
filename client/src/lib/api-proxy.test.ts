import assert from "node:assert/strict";
import { test } from "node:test";
import { proxyApiRequest } from "../utils/proxyApiRequest";

test("the public API route forwards requests to the internal service and returns its cookies", async () => {
  const previousServiceUrl = process.env.SERVER_URL;
  const previousFetch = globalThis.fetch;
  process.env.SERVER_URL = "https://server.internal";

  try {
    globalThis.fetch = async (request) => {
      assert.ok(request instanceof Request);
      assert.equal(request.url, "https://server.internal/auth/login?next=%2Fhome");
      assert.equal(request.method, "POST");
      assert.equal(request.headers.get("origin"), "https://bank.example");
      assert.equal(request.headers.get("cookie"), "gb_session=existing");
      assert.equal(request.headers.get("host"), null);
      assert.equal(request.headers.get("content-length"), null);
      assert.deepEqual(await request.json(), { email: "demo@example.com" });

      const headers = new Headers();
      headers.append("set-cookie", "gb_session=new; HttpOnly; Path=/");
      headers.append("set-cookie", "locale=es; Path=/");
      return new Response('{"ok":true}', { status: 201, headers });
    };

    const response = await proxyApiRequest(new Request("https://bank.example/api/auth/login?next=%2Fhome", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "28",
        cookie: "gb_session=existing",
        host: "bank.example",
        origin: "https://bank.example",
      },
      body: JSON.stringify({ email: "demo@example.com" }),
    }));

    assert.equal(response.status, 201);
    assert.deepEqual(response.headers.getSetCookie(), [
      "gb_session=new; HttpOnly; Path=/",
      "locale=es; Path=/",
    ]);
    assert.equal(await response.text(), '{"ok":true}');
  } finally {
    globalThis.fetch = previousFetch;
    if (previousServiceUrl === undefined) delete process.env.SERVER_URL;
    else process.env.SERVER_URL = previousServiceUrl;
  }
});
