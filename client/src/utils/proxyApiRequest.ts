export async function proxyApiRequest(request: Request): Promise<Response> {
  const serviceUrl = process.env.SERVER_URL
    ?? (process.env.NODE_ENV === "development" ? "http://localhost:3001" : undefined);

  if (!serviceUrl) return Response.json({ error: "API unavailable" }, { status: 503 });

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(serviceUrl);
  upstreamUrl.pathname = incomingUrl.pathname.slice("/api".length) || "/";
  upstreamUrl.search = incomingUrl.search;

  const upstreamRequest = new Request(upstreamUrl, request);
  for (const header of ["host", "connection", "content-length", "transfer-encoding"]) {
    upstreamRequest.headers.delete(header);
  }

  try {
    const upstreamResponse = await fetch(upstreamRequest, { cache: "no-store", redirect: "manual" });
    const headers = new Headers(upstreamResponse.headers);
    for (const header of ["content-encoding", "content-length", "transfer-encoding"]) {
      headers.delete(header);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  } catch {
    return Response.json({ error: "API unavailable" }, { status: 502 });
  }
}
