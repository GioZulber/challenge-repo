import { notFound, redirect } from "next/navigation";
import { getMovement } from "../../../generated/sdk.gen";
import type { Movement } from "../../../generated/types.gen";
import { getServerSession } from "../../../lib/server-api";
import MovementDetailScreen from "../../../screens/movements/MovementDetailScreen";

export default async function MovementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { auth, client } = await getServerSession();
  if (auth.status === "unauthenticated") redirect("/login");

  let initialMovement: Movement | null = null;
  if (auth.status === "authenticated" && client) {
    const result = await getMovement({ client, path: { id } }).catch(() => null);
    if (result?.response?.status === 401) redirect("/login");
    if (result?.response?.status === 404 || result?.response?.status === 400) notFound();
    initialMovement = result?.data ?? null;
  }

  return <MovementDetailScreen id={id} initialMovement={initialMovement} />;
}
