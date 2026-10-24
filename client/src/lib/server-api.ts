import "server-only";

import { cookies } from "next/headers";
import { createClient } from "../generated/client";
import { getSession } from "../generated/sdk.gen";
import type { User } from "../generated/types.gen";

export type InitialAuth =
  | { status: "unauthenticated" | "error"; user: null }
  | { status: "authenticated"; user: User };

export async function getServerSession() {
  const token = (await cookies()).get("gb_session")?.value;
  if (!token) return { auth: { status: "unauthenticated", user: null } as InitialAuth, client: null };

  const apiOrigin = process.env.API_ORIGIN ?? (process.env.NODE_ENV === "development" ? "http://localhost:3001" : undefined);
  if (!apiOrigin) return { auth: { status: "error", user: null } as InitialAuth, client: null };

  const client = createClient({
    baseUrl: apiOrigin,
    headers: { Cookie: `gb_session=${token}` },
    cache: "no-store",
    credentials: "omit",
  });

  try {
    const result = await getSession({ client });
    if (result.data) return { auth: { status: "authenticated", user: result.data.user } as InitialAuth, client };
    return {
      auth: { status: result.response?.status === 401 ? "unauthenticated" : "error", user: null } as InitialAuth,
      client: null,
    };
  } catch {
    return { auth: { status: "error", user: null } as InitialAuth, client: null };
  }
}
